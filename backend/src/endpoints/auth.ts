import { Hono } from 'hono';
import type { AppEnv } from '../types';
import { auth } from '../middleware/auth';
import {
  sendOtpHandler,
  verifyOtpHandler,
  googleAuthHandler,
  registerHandler,
  loginHandler,
  meHandler,
  updateProfileHandler,
  logoutHandler,
  logoutAllHandler,
} from '../handlers/auth';

export const authRouter = new Hono<AppEnv>();

// Public
authRouter.post('/send-otp', sendOtpHandler);
authRouter.post('/verify-otp', verifyOtpHandler);
authRouter.post('/google', googleAuthHandler);
authRouter.post('/register', registerHandler);
authRouter.post('/login', loginHandler);

// Protected
authRouter.use('/*', auth);
authRouter.get('/me', meHandler);
authRouter.put('/profile', updateProfileHandler);
authRouter.post('/logout', logoutHandler);
authRouter.post('/logout-all', logoutAllHandler);
