import express from 'express';
import { register, login, demoLogin, getMe, getDemoUsers } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/demo-login', demoLogin);
router.get('/me', protect, getMe);
router.get('/demo-users', getDemoUsers);

export default router;
