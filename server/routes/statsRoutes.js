import express from 'express';
import {
  getStats,
  getDepartments,
  getCategories,
  getSLARules,
  updateSLARule,
  getNotifications,
  markNotificationRead,
} from '../controllers/statsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', getStats);
router.get('/departments', getDepartments);
router.get('/categories', getCategories);
router.get('/sla-rules', getSLARules);
router.patch('/sla-rules', protect, authorize('admin'), updateSLARule);
router.get('/notifications', getNotifications);
router.patch('/notifications', markNotificationRead);

export default router;
