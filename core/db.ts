import * as Agenda from 'agenda';
import * as IoRedis from 'ioredis';
import * as mongoose from 'mongoose';
import { createConnection } from 'typeorm';

export const redis = new IoRedis(process.env.REDIS_URL);
export const agenda = new Agenda({ db: { address: process.env.MONGO_URL } });

mongoose.connect(process.env.MONGO_URL);

const db = mongoose.connection;
db.on('error', logger.error.bind(logger, 'connection error:'));
db.once('open', function() {
  // logger.log('mongo connect');
});

export async function setupDB() {
	return createConnection({
		type: 'postgres',
		host: 'postgres',
		// logging: true,
		username: process.env.POSTGRES_USERNAME,
		database: process.env.POSTGRES_DB,
		entities: [ __dirname + '/../app/entity/*' ],
		synchronize: true
		// cache: {
		// 	type: 'redis',
		// 	options: {
		// 		host: 'redis',
		// 		port: 6379
		// 	}
		// }
	});
}
