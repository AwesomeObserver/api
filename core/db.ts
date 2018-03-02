import * as Agenda from 'agenda';
import * as IoRedis from 'ioredis';
import * as mongoose from 'mongoose';
import { Client as PGClient } from 'pg';
import { createConnection } from 'typeorm';
import { logger } from 'core/logger';

export const setupRedis = () => {
	return new IoRedis(process.env.REDIS_URL);
}

export const redis = setupRedis();
export const agenda = new Agenda({ db: { address: process.env.MONGO_URL } });
export const pgClient = new PGClient({
  user: process.env.POSTGRES_USERNAME,
  host: 'postgres',
  database: process.env.POSTGRES_DB,
  port: 5432,
});

pgClient.connect();

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
	});
}
