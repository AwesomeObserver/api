// import { RedisPubSub } from 'graphql-redis-subscriptions';
import * as ioRedis from 'ioredis';

const { REDIS_URL } = process.env;

class PS {

  public publish() {

  }

}

export const PubSub = new PS();

// export const PubSub = new RedisPubSub({
//   publisher: new ioRedis(REDIS_URL),
//   subscriber: new ioRedis(REDIS_URL)
// });