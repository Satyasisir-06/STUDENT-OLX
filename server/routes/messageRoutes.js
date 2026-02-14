import express from 'express';
import {
    getOrCreateConversation,
    getConversations,
    getMessages,
    sendMessage,
    getUnreadCount,
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All message routes require auth

router.post('/conversation', getOrCreateConversation);
router.get('/conversations', getConversations);
router.get('/unread/count', getUnreadCount);
router.get('/:conversationId', getMessages);
router.post('/:conversationId', sendMessage);

export default router;
