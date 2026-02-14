import { db } from '../config/firebase.js';

const servicesRef = db.collection('services');
const usersRef = db.collection('users');

const getPosterData = async (userId) => {
    const doc = await usersRef.doc(userId).get();
    if (!doc.exists) return null;
    const data = doc.data();
    return { _id: doc.id, name: data.name, college: data.college };
};

// @desc    Get all services
// @route   GET /api/v1/services
export const getServices = async (req, res) => {
    try {
        const { type, serviceCategory, status, page = 1, limit = 12 } = req.query;

        const snap = await servicesRef.get();
        let services = snap.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));

        // Filter in memory
        if (type) services = services.filter((s) => s.type === type);
        if (serviceCategory) services = services.filter((s) => s.serviceCategory === serviceCategory);
        if (status) services = services.filter((s) => s.status === status);

        // Sort by newest
        services.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Paginate
        const total = services.length;
        const startIndex = (page - 1) * limit;
        services = services.slice(startIndex, startIndex + Number(limit));

        // Populate poster
        for (let s of services) {
            if (s.posterId) s.poster = await getPosterData(s.posterId);
        }

        res.status(200).json({
            success: true,
            services,
            pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('getServices error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get single service
// @route   GET /api/v1/services/:id
export const getService = async (req, res) => {
    try {
        const doc = await servicesRef.doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        const service = { _id: doc.id, ...doc.data() };
        if (service.posterId) service.poster = await getPosterData(service.posterId);

        res.status(200).json({ success: true, service });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Create service
// @route   POST /api/v1/services
export const createService = async (req, res) => {
    try {
        const { title, description, subject, semester, type, serviceCategory, price, deadline } = req.body;

        const serviceData = {
            title,
            description,
            subject: subject || '',
            semester: semester || '',
            type: type || 'request',
            serviceCategory: serviceCategory || 'other',
            price: Number(price) || 0,
            deadline: deadline || '',
            posterId: req.user._id,
            status: 'open',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const docRef = await servicesRef.add(serviceData);
        const service = { _id: docRef.id, ...serviceData };

        res.status(201).json({ success: true, service });
    } catch (error) {
        console.error('createService error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update service
// @route   PUT /api/v1/services/:id
export const updateService = async (req, res) => {
    try {
        const doc = await servicesRef.doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ success: false, message: 'Service not found' });

        const service = doc.data();
        if (service.posterId !== req.user._id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const updates = { ...req.body, updatedAt: new Date().toISOString() };
        await servicesRef.doc(req.params.id).update(updates);

        res.status(200).json({ success: true, service: { _id: doc.id, ...service, ...updates } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete service
// @route   DELETE /api/v1/services/:id
export const deleteService = async (req, res) => {
    try {
        const doc = await servicesRef.doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ success: false, message: 'Service not found' });

        const service = doc.data();
        if (service.posterId !== req.user._id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await servicesRef.doc(req.params.id).delete();
        res.status(200).json({ success: true, message: 'Service deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
// @desc    Update service status
// @route   PUT /api/v1/services/:id/status
export const updateServiceStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['open', 'in-progress', 'completed'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const doc = await servicesRef.doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ success: false, message: 'Service not found' });

        const service = doc.data();
        if (service.posterId !== req.user._id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await servicesRef.doc(req.params.id).update({
            status,
            updatedAt: new Date().toISOString()
        });

        res.status(200).json({ success: true, message: `Status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
