import * as crypto from 'crypto';
import { redis } from 'core/db';
import { userAPI, connectionAPI } from 'app/api';

export const schema = `
  currentUser: CurrentUser
`;

export async function resolver(root: any, args: any, ctx: any) {
  const { userId } = ctx;

  if (!userId) {
    return null;
  }

  const user = await userAPI.getById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // const token = connectionAPI.genToken(userId);

  const token = crypto.randomBytes(16).toString('hex');
  const key = `connectionToken:${token}`;
  await redis.set(key, userId);
  await redis.expire(key, 12);

  return {
    global: user,
    token
  };
}