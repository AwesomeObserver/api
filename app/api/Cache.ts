import { redis } from 'core/db';

export class CacheAPI {
  async get(key: string) {
    const res = await redis.get(key);

    if (typeof res != 'string') {
      return [false, null];
    }

    return [true, JSON.parse(res)];
  }

  async set(key: string, data: any, expire: number = 60 * 60) {
    await redis.set(key, JSON.stringify(data));
    return redis.expire(key, expire);
  }

  async del(key: string) {
    return redis.del(key);
  }
}