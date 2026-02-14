import express from 'express';
import {
    getListings,
    getListing,
    createListing,
    updateListing,
    deleteListing,
    searchListings,
    getMyListings,
} from '../controllers/listingController.js';
import { protect } from '../middleware/auth.js';
import upload, { compressImages } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getListings);
router.get('/search', searchListings);

// Private routes
router.get('/my', protect, getMyListings);
router.get('/:id', getListing);
router.post('/', protect, upload.array('images', 5), compressImages, createListing);
router.put('/:id', protect, upload.array('images', 5), compressImages, updateListing);
router.delete('/:id', protect, deleteListing);

export default router;
