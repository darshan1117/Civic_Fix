import express from 'express';
import { escalateOverdueIssues } from '../controllers/cronController.js';

const router = express.Router();

router.get('/escalate', escalateOverdueIssues);
router.post('/escalate', escalateOverdueIssues);
router.get('/check-sla', escalateOverdueIssues);
router.post('/check-sla', escalateOverdueIssues);

export default router;
