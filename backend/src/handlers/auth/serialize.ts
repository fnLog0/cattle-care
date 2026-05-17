import type { UserRow } from '../../db/users/schema';

/**
 * Strip server-only fields (password_hash) before returning a user to a client.
 */
export function publicUser(user: UserRow) {
  const { password_hash, ...rest } = user;
  void password_hash;
  return rest;
}
