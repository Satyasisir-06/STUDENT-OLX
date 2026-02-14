import express from 'express';
import { getUserProfile, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.put('/me', protect, updateProfile);
router.get('/:id', getUserProfile);

export default router;
