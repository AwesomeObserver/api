import { redis } from 'core/db';

export class ActionTime {
	async get(userId, actionName) {
		const key = `users:${userId}:actionsTime`;
		const date = await redis.hget(key, actionName);

		return !!date ? parseInt(date, 10) : 0;
	}

	async set(userId, actionName) {
		const key = `users:${userId}:actionsTime`;
		return redis.hset(key, actionName, +new Date());
	}
}

export const actionTime = new ActionTime();
