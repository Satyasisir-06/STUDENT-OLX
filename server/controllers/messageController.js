import { db } from '../config/firebase.js';

const conversationsRef = db.collection('conversations');
const messagesRef = db.collection('messages');
const usersRef = db.collection('users');

const getUserData = async (userId) => {
    const doc = await usersRef.doc(userId).get();
    if (!doc.exists) return { _id: userId, name: 'Student' };
    const d = doc.data();
    return { _id: doc.id, name: d.name, avatar: d.avatar, college: d.college, year: d.year };
};

// @desc    Get or create conversation
// @route   POST /api/v1/messages/conversation
export const getOrCreateConversation = async (req, res) => {
    try {
        const { recipientId, listingId } = req.body;
        const userId = req.user._id;

        if (!recipientId) return res.status(400).json({ success: false, message: 'Recipient required' });
        if (recipientId === userId) return res.status(400).json({ success: false, message: 'Cannot message yourself' });

        // Search for existing conversation
        const snap = await conversationsRef
            .where('participantIds', 'array-contains', userId)
            .get();

        let conversation = null;
        snap.docs.forEach((doc) => {
            const data = doc.data();
            if (data.participantIds.includes(recipientId)) {
                if (!listingId || data.listingId === listingId) {
                    conversation = { _id: doc.id, ...data };
                }
            }
        });

        if (!conversation) {
            const convData = {
                participantIds: [userId, recipientId],
                listingId: listingId || '',
                lastMessage: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            const docRef = await conversationsRef.add(convData);
            conversation = { _id: docRef.id, ...convData };
        }

        // Populate participants
        conversation.participants = await Promise.all(
            conversation.participantIds.map((id) => getUserData(id))
        );

        // Populate listing if exists
        if (conversation.listingId) {
            const listingDoc = await db.collection('listings').doc(conversation.listingId).get();
            if (listingDoc.exists) {
                const ld = listingDoc.data();
                conversation.listing = { _id: listingDoc.id, title: ld.title, images: ld.images, price: ld.price };
            }
        }

        res.status(200).json({ success: true, conversation });
    } catch (error) {
        console.error('getOrCreateConversation error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all conversations
// @route   GET /api/v1/messages/conversations
export const getConversations = async (req, res) => {
    try {
        const snap = await conversationsRef
            .where('participantIds', 'array-contains', req.user._id)
            .get();

        const conversations = [];
        for (const doc of snap.docs) {
            const conv = { _id: doc.id, ...doc.data() };
            conv.participants = await Promise.all(
                conv.participantIds.map((id) => getUserData(id))
            );
            if (conv.listingId) {
                const listingDoc = await db.collection('listings').doc(conv.listingId).get();
                if (listingDoc.exists) {
                    const ld = listingDoc.data();
                    conv.listing = { _id: listingDoc.id, title: ld.title, images: ld.images, price: ld.price };
                }
            }
            conversations.push(conv);
        }

        // Sort by updatedAt in memory
        conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        res.status(200).json({ success: true, conversations });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get messages
// @route   GET /api/v1/messages/:conversationId
export const getMessages = async (req, res) => {
    try {
        const convDoc = await conversationsRef.doc(req.params.conversationId).get();
        if (!convDoc.exists) return res.status(404).json({ success: false, message: 'Conversation not found' });

        const conv = convDoc.data();
        if (!conv.participantIds.includes(req.user._id)) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const snap = await messagesRef
            .where('conversationId', '==', req.params.conversationId)
            .get();

        const messages = [];
        for (const doc of snap.docs) {
            const msg = { _id: doc.id, ...doc.data() };
            msg.sender = await getUserData(msg.senderId);
            messages.push(msg);
        }

        // Sort by time in memory
        messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        // Mark unread as read
        const unread = snap.docs.filter((d) => {
            const data = d.data();
            return data.senderId !== req.user._id && !data.read;
        });
        for (const doc of unread) {
            await messagesRef.doc(doc.id).update({ read: true });
        }

        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error('getMessages error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Send message
// @route   POST /api/v1/messages/:conversationId
export const sendMessage = async (req, res) => {
    try {
        const { text } = req.body;
        const convDoc = await conversationsRef.doc(req.params.conversationId).get();
        if (!convDoc.exists) return res.status(404).json({ success: false, message: 'Conversation not found' });

        const conv = convDoc.data();
        if (!conv.participantIds.includes(req.user._id)) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        if (!text || !text.trim()) {
            return res.status(400).json({ success: false, message: 'Message cannot be empty' });
        }

        const msgData = {
            conversationId: req.params.conversationId,
            senderId: req.user._id,
            text: text.trim(),
            read: false,
            createdAt: new Date().toISOString(),
        };

        const docRef = await messagesRef.add(msgData);

        // Update conversation lastMessage
        await conversationsRef.doc(req.params.conversationId).update({
            lastMessage: { text: text.trim().slice(0, 100), senderId: req.user._id, createdAt: msgData.createdAt },
            updatedAt: msgData.createdAt,
        });

        const message = { _id: docRef.id, ...msgData };
        message.sender = await getUserData(req.user._id);

        res.status(201).json({ success: true, message });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Unread count
// @route   GET /api/v1/messages/unread/count
export const getUnreadCount = async (req, res) => {
    try {
        const convSnap = await conversationsRef
            .where('participantIds', 'array-contains', req.user._id)
            .get();

        let count = 0;
        for (const doc of convSnap.docs) {
            const msgSnap = await messagesRef
                .where('conversationId', '==', doc.id)
                .get();

            msgSnap.docs.forEach((m) => {
                const data = m.data();
                if (data.senderId !== req.user._id && !data.read) count++;
            });
        }

        res.status(200).json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
