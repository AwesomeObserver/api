import * as crypto from 'crypto';
import { broker } from 'core';
import { redis } from 'core/db';

export const schema = `
  currentUser: CurrentUser
`;

export async function resolver(root: any, args: any, ctx: any) {
	const { userId } = ctx;

	if (!userId) {
		return null;
	}

	const user = await broker.call('user.getOne', { userId });

	if (!user) {
		throw new Error('User not found');
	}

	const token = crypto.randomBytes(16).toString('hex');
	const key = `connectionToken:${token}`;
	await redis.set(key, userId);
	await redis.expire(key, 12);

	return {
		global: user,
		token
	};
}
