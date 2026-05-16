import { Hono } from 'hono';
import type { AppEnv } from '../types';
import { auth } from '../middleware/auth';
import { uploadCattleImageHandler } from '../handlers/upload';

export const uploadRouter = new Hono<AppEnv>();

uploadRouter.use('*', auth);

// POST /api/upload/cattle-image — multipart/form-data with field "image"
uploadRouter.post('/cattle-image', uploadCattleImageHandler);
