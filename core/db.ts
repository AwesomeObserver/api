import * as Agenda from 'agenda';
import * as IoRedis from 'ioredis';
import { createConnection } from 'typeorm';

export const redis = new IoRedis(process.env.REDIS_URL);
export const agenda = new Agenda({ db: { address: process.env.MONGO_URL } });

export async function setupDB() {
	return createConnection({
		type: 'postgres',
		host: 'postgres',
		// logging: true,
		username: process.env.POSTGRES_USERNAME,
		database: process.env.POSTGRES_DB,
		entities: [ __dirname + '/../app/entity/*' ],
		synchronize: true,
		cache: {
			type: 'redis',
			options: {
				host: 'redis',
				port: 6379
			}
		}
	});
}
