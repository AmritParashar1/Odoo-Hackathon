import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.schemas';

const router = Router();

// Public routes
router.post('/register', validate({ body: registerSchema }), authController.register.bind(authController));
router.post('/login', validate({ body: loginSchema }), authController.login.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));
router.post('/logout', authController.logout.bind(authController));

// Protected routes
router.get('/profile', authenticate, authController.getProfile.bind(authController));

export default router;
