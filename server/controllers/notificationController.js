import { db } from '../config/firebase.js';

const notificationsRef = db.collection('notifications');
const usersRef = db.collection('users');

// @desc    Get user's notifications
// @route   GET /api/v1/notifications
export const getNotifications = async (req, res) => {
    try {
        const snap = await notificationsRef
            .where('userId', '==', req.user._id)
            .get();

        const notifications = snap.docs
            .map((doc) => ({ _id: doc.id, ...doc.data() }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 50);

        res.status(200).json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get unread notification count
// @route   GET /api/v1/notifications/unread
export const getUnreadCount = async (req, res) => {
    try {
        const snap = await notificationsRef
            .where('userId', '==', req.user._id)
            .where('read', '==', false)
            .get();

        res.status(200).json({ success: true, count: snap.size });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/:id/read
export const markAsRead = async (req, res) => {
    try {
        await notificationsRef.doc(req.params.id).update({ read: true });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Mark all as read
// @route   PUT /api/v1/notifications/read-all
export const markAllRead = async (req, res) => {
    try {
        const snap = await notificationsRef
            .where('userId', '==', req.user._id)
            .where('read', '==', false)
            .get();

        for (const doc of snap.docs) {
            await notificationsRef.doc(doc.id).update({ read: true });
        }

        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Helper: Create a notification (used by other controllers)
export const createNotification = async (userId, type, message, link = '') => {
    try {
        await notificationsRef.add({
            userId,
            type,
            message,
            link,
            read: false,
            createdAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Create notification error:', error);
    }
};
