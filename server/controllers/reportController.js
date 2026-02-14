import { db } from '../config/firebase.js';
import { createNotification } from './notificationController.js';

const reportsRef = db.collection('reports');
const usersRef = db.collection('users');

// @desc    Create a report
// @route   POST /api/v1/reports
export const createReport = async (req, res) => {
    try {
        const { targetType, targetId, reason, description } = req.body;

        if (!targetType || !targetId || !reason) {
            return res.status(400).json({ success: false, message: 'Target type, target ID, and reason are required' });
        }

        const validTypes = ['listing', 'user', 'service', 'message'];
        if (!validTypes.includes(targetType)) {
            return res.status(400).json({ success: false, message: 'Invalid target type' });
        }

        const validReasons = ['spam', 'fraud', 'inappropriate', 'other'];
        if (!validReasons.includes(reason)) {
            return res.status(400).json({ success: false, message: 'Invalid reason' });
        }

        // Check for duplicate report
        const existing = await reportsRef
            .where('reporterId', '==', req.user._id)
            .where('targetId', '==', targetId)
            .get();

        if (!existing.empty) {
            return res.status(400).json({ success: false, message: 'You have already reported this' });
        }

        const reportData = {
            reporterId: req.user._id,
            reporterName: req.user.name,
            targetType,
            targetId,
            reason,
            description: description?.trim() || '',
            status: 'pending',
            createdAt: new Date().toISOString(),
        };

        const docRef = await reportsRef.add(reportData);

        // Notify admins
        const adminsSnap = await usersRef.where('role', '==', 'admin').get();
        for (const admin of adminsSnap.docs) {
            await createNotification(
                admin.id,
                'report',
                `New ${targetType} report: ${reason}`,
                '/admin'
            );
        }

        res.status(201).json({ success: true, report: { _id: docRef.id, ...reportData } });
    } catch (error) {
        console.error('Create report error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all reports (Admin)
// @route   GET /api/v1/reports
export const getReports = async (req, res) => {
    try {
        const snap = await reportsRef.get();

        const reports = snap.docs
            .map((doc) => ({ _id: doc.id, ...doc.data() }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json({ success: true, reports });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update report status (Admin)
// @route   PUT /api/v1/reports/:id
export const updateReport = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'reviewed', 'resolved'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        await reportsRef.doc(req.params.id).update({
            status,
            resolvedAt: status === 'resolved' ? new Date().toISOString() : null,
            resolvedBy: status === 'resolved' ? req.user._id : null,
        });

        res.status(200).json({ success: true, message: `Report marked as ${status}` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
