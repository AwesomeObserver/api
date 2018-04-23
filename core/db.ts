import * as Agenda from 'agenda';
import * as IoRedis from 'ioredis';
import { createConnection } from 'typeorm';
import { logger } from 'core/logger';

export const setupRedis = () => {
	return new IoRedis(process.env.REDIS_URL);
};

export const redis = setupRedis();
export const agenda = new Agenda({ db: { address: process.env.MONGO_URL } });

export async function setupDB() {
	return createConnection({
		type: 'postgres',
		url: process.env.POSTGRES_URL,
		// logging: true,
		entities: [__dirname + '/../app/entity/*'],
		synchronize: true
	});
}
