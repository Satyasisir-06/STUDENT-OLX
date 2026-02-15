import { db } from '../config/firebase.js';

const listingsRef = db.collection('listings');
const usersRef = db.collection('users');

// Helper: get user data for embedding in listing
const getSellerData = async (userId) => {
    const doc = await usersRef.doc(userId).get();
    if (!doc.exists) return null;
    const data = doc.data();
    return { _id: doc.id, name: data.name, college: data.college, year: data.year, avatar: data.avatar };
};

// @desc    Get all listings
// @route   GET /api/v1/listings
export const getListings = async (req, res) => {
    try {
        const { category, condition, sort, search, page = 1, limit = 12 } = req.query;

        // Use simple query, filter/sort in memory to avoid compound index issues
        const snap = await listingsRef.get();

        let listings = snap.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));

        // Filter active
        listings = listings.filter((l) => l.status === 'active');

        // Filter by category
        if (category) listings = listings.filter((l) => l.category === category);

        // Filter by condition
        if (condition) listings = listings.filter((l) => l.condition === condition);

        // Search
        if (search) {
            const searchLower = search.toLowerCase();
            listings = listings.filter((l) =>
                l.title?.toLowerCase().includes(searchLower) ||
                l.description?.toLowerCase().includes(searchLower)
            );
        }

        // Sort
        if (sort === 'price_low') {
            listings.sort((a, b) => a.price - b.price);
        } else if (sort === 'price_high') {
            listings.sort((a, b) => b.price - a.price);
        } else {
            listings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        // Pagination
        const total = listings.length;
        const startIndex = (page - 1) * limit;
        listings = listings.slice(startIndex, startIndex + Number(limit));

        // Populate seller data
        for (let listing of listings) {
            if (listing.sellerId) {
                listing.seller = await getSellerData(listing.sellerId);
            }
        }

        res.status(200).json({
            success: true,
            listings,
            pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('getListings error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Search listings
// @route   GET /api/v1/listings/search
export const searchListings = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(200).json({ success: true, listings: [] });

        const snap = await listingsRef.get();
        const searchLower = q.toLowerCase();

        let listings = snap.docs
            .map((doc) => ({ _id: doc.id, ...doc.data() }))
            .filter((l) =>
                l.status === 'active' && (
                    l.title?.toLowerCase().includes(searchLower) ||
                    l.description?.toLowerCase().includes(searchLower)
                )
            );

        for (let listing of listings) {
            if (listing.sellerId) listing.seller = await getSellerData(listing.sellerId);
        }

        res.status(200).json({ success: true, listings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get single listing
// @route   GET /api/v1/listings/:id
export const getListing = async (req, res) => {
    try {
        const doc = await listingsRef.doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        const listing = { _id: doc.id, ...doc.data() };

        // Increment views
        await listingsRef.doc(doc.id).update({ views: (listing.views || 0) + 1 });
        listing.views = (listing.views || 0) + 1;

        // Populate seller
        if (listing.sellerId) {
            listing.seller = await getSellerData(listing.sellerId);
        }

        res.status(200).json({ success: true, listing });
    } catch (error) {
        console.error('getListing error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Create listing
// @route   POST /api/v1/listings
export const createListing = async (req, res) => {
    try {
        const { title, description, price, category, condition, isNegotiable } = req.body;

        const images = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];

        const listingData = {
            title,
            description,
            price: Number(price) || 0,
            category: category || 'other',
            condition: condition || 'good',
            isNegotiable: isNegotiable === 'true',
            images,
            sellerId: req.user._id,
            status: 'active',
            views: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const docRef = await listingsRef.add(listingData);
        const listing = { _id: docRef.id, ...listingData };
        listing.seller = await getSellerData(req.user._id);

        res.status(201).json({ success: true, listing });
    } catch (error) {
        console.error('createListing error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update listing
// @route   PUT /api/v1/listings/:id
export const updateListing = async (req, res) => {
    try {
        const doc = await listingsRef.doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        const listing = doc.data();
        if (listing.sellerId !== req.user._id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const updates = { ...req.body, updatedAt: new Date().toISOString() };
        await listingsRef.doc(req.params.id).update(updates);

        res.status(200).json({ success: true, listing: { _id: doc.id, ...listing, ...updates } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete listing
// @route   DELETE /api/v1/listings/:id
export const deleteListing = async (req, res) => {
    try {
        const doc = await listingsRef.doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        const listing = doc.data();
        if (listing.sellerId !== req.user._id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await listingsRef.doc(req.params.id).delete();
        res.status(200).json({ success: true, message: 'Listing deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get my listings
// @route   GET /api/v1/listings/my
export const getMyListings = async (req, res) => {
    try {
        const snap = await listingsRef
            .where('sellerId', '==', req.user._id)
            .get();

        const listings = snap.docs
            .map((doc) => ({ _id: doc.id, ...doc.data() }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json({ success: true, listings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get category counts
// @route   GET /api/v1/listings/categories/counts
export const getCategoryCounts = async (req, res) => {
    try {
        const categories = ['Books', 'Electronics', 'Stationery', 'Clothing', 'Hostel', 'Lab Equipment', 'Other'];
        const counts = {};

        // Run in parallel for performance
        await Promise.all(categories.map(async (cat) => {
            const snapshot = await listingsRef
                .where('category', '==', cat)
                .where('status', '==', 'active')
                .count()
                .get();

            counts[cat] = snapshot.data().count;
        }));

        res.status(200).json({ success: true, counts });
    } catch (error) {
        console.error('getCategoryCounts error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
