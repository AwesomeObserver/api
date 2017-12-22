import * as agenda from 'agenda';
import * as ioRedis from 'ioredis';
import { createConnection } from "typeorm";

const {
  POSTGRES_USERNAME,
  POSTGRES_DB,
  REDIS_URL,
  MONGO_URL
} = process.env;

export const Redis = new ioRedis(REDIS_URL);

export const Agenda = new agenda({ db: { address: MONGO_URL } });  

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