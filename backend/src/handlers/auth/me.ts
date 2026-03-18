import type { AppContext } from '../../types';
import { success } from '../../utils/responses';

export async function meHandler(c: AppContext) {
  return success(c, c.get('user'));
}
