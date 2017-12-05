export default class {
  GG: any;
  
  constructor(GG) {
    this.GG = GG;
  }

  async get(userId, actionName) {
    const key = `users:${userId}:actionsTime`;
    const date = await this.GG.DB.Redis.hget(key, actionName);
  
    return !!date ? parseInt(date, 10) : 0;
  }
  
  async set(userId, actionName) {
    const key = `users:${userId}:actionsTime`;
    return this.GG.DB.Redis.hset(key, actionName, +new Date());
  }
}