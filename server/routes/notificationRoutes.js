import express from 'express';
import { getNotifications, getUnreadCount, markAsRead, markAllRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.get('/unread', getUnreadCount);
router.put('/read-all', markAllRead);
router.put('/:id/read', markAsRead);

export default router;
