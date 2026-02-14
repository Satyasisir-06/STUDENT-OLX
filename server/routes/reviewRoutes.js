import express from 'express';
import { getUserReviews, createReview, toggleWishlist, getWishlist } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Reviews
router.get('/reviews/:userId', getUserReviews);
router.post('/reviews', protect, createReview);

// Wishlist
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:listingId', protect, toggleWishlist);

export default router;
