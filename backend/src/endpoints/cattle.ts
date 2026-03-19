import { Hono } from 'hono';
import type { AppEnv } from '../types';
import { auth } from '../middleware/auth';
import { listCattle, getCattle, createCattleHandler, updateCattleHandler, deleteCattleHandler } from '../handlers/cattle';

export const cattleRouter = new Hono<AppEnv>();

cattleRouter.use('*', auth);

cattleRouter.get('/', listCattle);
cattleRouter.post('/', createCattleHandler);
cattleRouter.get('/:id', getCattle);
cattleRouter.put('/:id', updateCattleHandler);
cattleRouter.delete('/:id', deleteCattleHandler);
