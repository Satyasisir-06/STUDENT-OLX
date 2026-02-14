import express from 'express';
import { createReport, getReports, updateReport } from '../controllers/reportController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createReport);
router.get('/', protect, adminOnly, getReports);
router.put('/:id', protect, adminOnly, updateReport);

export default router;
