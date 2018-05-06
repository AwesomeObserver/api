import * as IoRedis from 'ioredis';
import { createConnection } from 'typeorm';
import { logger } from 'core/logger';

export const setupRedis = () => {
	return new IoRedis(process.env.REDIS_URL);
};

export const redis = setupRedis();

export async function setupDB() {
	return createConnection({
		type: 'postgres',
		url: process.env.POSTGRES_URL,
		// logging: true,
		entities: [__dirname + '/../app/entity/*'],
		synchronize: true
	});
}
