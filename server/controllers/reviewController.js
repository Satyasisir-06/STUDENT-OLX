import { db } from '../config/firebase.js';

const reviewsRef = db.collection('reviews');
const usersRef = db.collection('users');

// @desc    Get reviews for a user
// @route   GET /api/v1/reviews/:userId
export const getUserReviews = async (req, res) => {
    try {
        const snap = await reviewsRef
            .where('revieweeId', '==', req.params.userId)
            .get();

        const reviews = [];
        for (const doc of snap.docs) {
            const review = { _id: doc.id, ...doc.data() };
            const reviewerDoc = await usersRef.doc(review.reviewerId).get();
            if (reviewerDoc.exists) {
                const rd = reviewerDoc.data();
                review.reviewer = { _id: reviewerDoc.id, name: rd.name, avatar: rd.avatar, college: rd.college };
            }
            reviews.push(review);
        }

        reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const total = reviews.length;
        const avgRating = total > 0
            ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1))
            : 0;

        res.status(200).json({ success: true, reviews, avgRating, total });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Create review
// @route   POST /api/v1/reviews
export const createReview = async (req, res) => {
    try {
        const { revieweeId, listingId, rating, comment } = req.body;

        if (!revieweeId || !rating) {
            return res.status(400).json({ success: false, message: 'Reviewee and rating required' });
        }
        if (revieweeId === req.user._id) {
            return res.status(400).json({ success: false, message: 'Cannot review yourself' });
        }

        // Check for duplicate
        const existing = await reviewsRef
            .where('reviewerId', '==', req.user._id)
            .where('revieweeId', '==', revieweeId)
            .get();

        if (!existing.empty) {
            return res.status(400).json({ success: false, message: 'You already reviewed this user' });
        }

        const reviewData = {
            reviewerId: req.user._id,
            revieweeId,
            listingId: listingId || '',
            rating: Number(rating),
            comment: comment?.trim() || '',
            createdAt: new Date().toISOString(),
        };

        const docRef = await reviewsRef.add(reviewData);

        // Update user's average rating
        const allReviews = await reviewsRef.where('revieweeId', '==', revieweeId).get();
        const avg = allReviews.docs.reduce((sum, d) => sum + d.data().rating, 0) / allReviews.size;
        await usersRef.doc(revieweeId).update({ rating: Number(avg.toFixed(1)) });

        const review = { _id: docRef.id, ...reviewData };
        review.reviewer = { _id: req.user._id, name: req.user.name };

        res.status(201).json({ success: true, review });
    } catch (error) {
        console.error('createReview error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Toggle wishlist
// @route   POST /api/v1/wishlist/:listingId
export const toggleWishlist = async (req, res) => {
    try {
        const userDoc = await usersRef.doc(req.user._id).get();
        const userData = userDoc.data();
        const wishlist = userData.wishlist || [];
        const listingId = req.params.listingId;

        const index = wishlist.indexOf(listingId);
        if (index > -1) {
            wishlist.splice(index, 1);
        } else {
            wishlist.push(listingId);
        }

        await usersRef.doc(req.user._id).update({ wishlist });

        res.status(200).json({ success: true, wishlisted: index === -1, wishlist });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get wishlist
// @route   GET /api/v1/wishlist
export const getWishlist = async (req, res) => {
    try {
        const userDoc = await usersRef.doc(req.user._id).get();
        const wishlist = userDoc.data().wishlist || [];

        const listings = [];
        for (const id of wishlist) {
            const doc = await db.collection('listings').doc(id).get();
            if (doc.exists) {
                const listing = { _id: doc.id, ...doc.data() };
                if (listing.sellerId) {
                    const sellerDoc = await usersRef.doc(listing.sellerId).get();
                    if (sellerDoc.exists) {
                        const sd = sellerDoc.data();
                        listing.seller = { _id: sellerDoc.id, name: sd.name, avatar: sd.avatar, college: sd.college };
                    }
                }
                listings.push(listing);
            }
        }

        res.status(200).json({ success: true, listings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
