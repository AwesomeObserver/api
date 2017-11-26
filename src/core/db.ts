import * as Agenda from 'agenda';
import * as ioRedis from 'ioredis';
import { createConnection } from "typeorm";

const {
  POSTGRES_USERNAME,
  POSTGRES_DB,
  REDIS_URL,
  MONGO_URL
} = process.env;

export async function setupDB() {
  let DB = {};

  DB['Redis'] = new ioRedis(REDIS_URL);
  DB['Agenda'] = new Agenda({ db: { address: MONGO_URL } });

  DB['TO'] = await createConnection({
    type: "postgres",
    host: "postgres",
    username: POSTGRES_USERNAME,
    database: POSTGRES_DB,
    entities: [
      __dirname + "/../entity/*.ts"
    ],
    synchronize: true,
  });

  return DB;
}