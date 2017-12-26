import * as Agenda from 'agenda';
import * as IoRedis from 'ioredis';
import { createConnection } from "typeorm";

const {
  POSTGRES_USERNAME,
  POSTGRES_DB,
  REDIS_URL,
  MONGO_URL
} = process.env;

export const redis = new IoRedis(REDIS_URL);
export const agenda = new Agenda({ db: { address: MONGO_URL } });  

export async function setupDB () {
  return createConnection({
    type: "postgres",
    host: "postgres",
    // logging: true,
    username: POSTGRES_USERNAME,
    database: POSTGRES_DB,
    entities: [
      __dirname + "/../app/entity/*"
    ],
    synchronize: true,
    cache: {
      type: "redis",
      options: {
        host: "redis",
        port: 6379
      }
    }
  });
}