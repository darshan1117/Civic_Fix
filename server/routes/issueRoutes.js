import express from 'express';
import {
  getIssues,
  getIssueById,
  checkDuplicates,
  createIssue,
  updateStatus,
  toggleUpvote,
} from '../controllers/issueController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getIssues);
router.post('/check-duplicates', checkDuplicates);
router.get('/:id', getIssueById);
router.post('/', protect, createIssue);
router.patch('/:id/status', protect, updateStatus);
router.post('/:id/upvote', protect, toggleUpvote);

export default router;
