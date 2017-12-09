import { Redis } from 'core/db';

export class ActionTimeClass {

  async get(userId, actionName) {
    const key = `users:${userId}:actionsTime`;
    const date = await Redis.hget(key, actionName);
  
    return !!date ? parseInt(date, 10) : 0;
  }
  
  async set(userId, actionName) {
    const key = `users:${userId}:actionsTime`;
    return Redis.hset(key, actionName, +new Date());
  }
}

export const ActionTime = new ActionTimeClass();