import { db } from '../config/firebase.js';

const usersRef = db.collection('users');

// @desc    Get user profile
// @route   GET /api/v1/users/:id
export const getUserProfile = async (req, res) => {
    try {
        const doc = await usersRef.doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const profile = { _id: doc.id, ...doc.data() };
        delete profile.password;

        // Get listings (simple query — no compound index needed)
        try {
            const listingsSnap = await db.collection('listings')
                .where('sellerId', '==', doc.id)
                .get();
            profile.listings = listingsSnap.docs
                .map((d) => ({ _id: d.id, ...d.data() }))
                .filter((l) => l.status === 'active')
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch {
            profile.listings = [];
        }

        // Get services (simple query — no compound index needed)
        try {
            const servicesSnap = await db.collection('services')
                .where('posterId', '==', doc.id)
                .get();
            profile.services = servicesSnap.docs
                .map((d) => ({ _id: d.id, ...d.data() }))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch {
            profile.services = [];
        }

        res.status(200).json({ success: true, profile });
    } catch (error) {
        console.error('getUserProfile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update profile
// @route   PUT /api/v1/users/me
export const updateProfile = async (req, res) => {
    try {
        const allowedFields = ['name', 'college', 'year', 'branch', 'phone', 'bio'];
        const updates = {};
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });
        updates.updatedAt = new Date().toISOString();

        await usersRef.doc(req.user._id).update(updates);
        const doc = await usersRef.doc(req.user._id).get();
        const user = { _id: doc.id, ...doc.data() };
        delete user.password;

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
