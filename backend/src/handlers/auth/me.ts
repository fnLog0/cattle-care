import type { AppContext } from '../../types';
import { success } from '../../utils/responses';
import { publicUser } from './serialize';

export async function meHandler(c: AppContext) {
  return success(c, publicUser(c.get('user')));
}
