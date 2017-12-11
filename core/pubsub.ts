import { RedisPubSub } from 'graphql-redis-subscriptions';
import * as ioRedis from 'ioredis';

const { REDIS_URL } = process.env;

export const PubSub = new RedisPubSub({
  publisher: new ioRedis(REDIS_URL),
  subscriber: new ioRedis(REDIS_URL)
});