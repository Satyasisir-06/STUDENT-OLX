import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { db } from '../config/firebase.js';
import { createNotification } from '../controllers/notificationController.js';

const router = express.Router();
const usersRef = db.collection('users');

router.use(protect, adminOnly);

// @desc    Get admin stats
// @route   GET /api/v1/admin/stats
router.get('/stats', async (req, res) => {
    try {
        const [usersSnap, listingsSnap, servicesSnap, reportsSnap] = await Promise.all([
            db.collection('users').get(),
            db.collection('listings').get(),
            db.collection('services').get(),
            db.collection('reports').get(),
        ]);

        const pendingReports = reportsSnap.docs.filter((d) => d.data().status === 'pending').length;

        res.status(200).json({
            success: true,
            stats: {
                users: usersSnap.size,
                listings: listingsSnap.size,
                services: servicesSnap.size,
                reports: reportsSnap.size,
                pendingReports,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Get all users
// @route   GET /api/v1/admin/users
router.get('/users', async (req, res) => {
    try {
        const snap = await usersRef.get();
        const users = snap.docs.map((doc) => {
            const data = doc.data();
            delete data.password;
            return { _id: doc.id, ...data };
        });

        users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Delete a user (and their data)
// @route   DELETE /api/v1/admin/users/:id
router.delete('/users/:id', async (req, res) => {
    try {
        const userDoc = await usersRef.doc(req.params.id).get();
        if (!userDoc.exists) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Delete user's listings
        const listings = await db.collection('listings').where('sellerId', '==', req.params.id).get();
        for (const doc of listings.docs) await db.collection('listings').doc(doc.id).delete();

        // Delete user's services
        const services = await db.collection('services').where('posterId', '==', req.params.id).get();
        for (const doc of services.docs) await db.collection('services').doc(doc.id).delete();

        // Delete user
        await usersRef.doc(req.params.id).delete();

        res.status(200).json({ success: true, message: 'User and associated data deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Ban/Unban a user
// @route   PUT /api/v1/admin/users/:id/ban
router.put('/users/:id/ban', async (req, res) => {
    try {
        const userDoc = await usersRef.doc(req.params.id).get();
        if (!userDoc.exists) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const userData = userDoc.data();
        const newBanStatus = !userData.isBanned;

        await usersRef.doc(req.params.id).update({
            isBanned: newBanStatus,
            updatedAt: new Date().toISOString(),
        });

        // Notify the user
        await createNotification(
            req.params.id,
            'system',
            newBanStatus ? 'Your account has been suspended by an admin.' : 'Your account has been reactivated.',
            ''
        );

        res.status(200).json({
            success: true,
            message: newBanStatus ? 'User banned' : 'User unbanned',
            isBanned: newBanStatus,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Get all listings (admin)
// @route   GET /api/v1/admin/listings
router.get('/listings', async (req, res) => {
    try {
        const snap = await db.collection('listings').get();
        const listings = snap.docs
            .map((doc) => ({ _id: doc.id, ...doc.data() }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json({ success: true, listings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @desc    Delete any listing (admin) 
// @route   DELETE /api/v1/admin/listings/:id
router.delete('/listings/:id', async (req, res) => {
    try {
        await db.collection('listings').doc(req.params.id).delete();
        res.status(200).json({ success: true, message: 'Listing deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
