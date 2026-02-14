import express from 'express';
import {
    getServices,
    getService,
    createService,
    updateService,
    deleteService,
    updateServiceStatus,
} from '../controllers/serviceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getServices);
router.get('/:id', getService);
router.post('/', protect, createService);
router.put('/:id', protect, updateService);
router.put('/:id/status', protect, updateServiceStatus);
router.delete('/:id', protect, deleteService);

export default router;
