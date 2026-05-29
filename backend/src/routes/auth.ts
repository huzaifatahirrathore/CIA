import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import AuthController from '../controller/AuthController';
import { validateEmpty } from '../middlewares/checkBody';
import { checkJwt } from '../middlewares/checkJwt';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again after 15 minutes.' },
});

router.post('/login',           [authLimiter, validateEmpty], AuthController.login);
router.post('/register',        [authLimiter, validateEmpty], AuthController.register);
router.post('/refresh',         [authLimiter],                AuthController.refresh);
router.post('/logout',          [],                           AuthController.logout);
router.get('/me',               [checkJwt],                  AuthController.getMe);
router.post('/change-password', [checkJwt],                  AuthController.changePassword);

export default router;
