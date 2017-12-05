export default class {

  GG: any;

  constructor(GG) {
    this.GG = GG;
  }

  async getCount(roomId: string) {
    const key = `rooms:${roomId}:connectionCounts`;
    const countsObj = await this.GG.DB.Redis.hgetall(key);
    
    const usersCount = parseInt(countsObj['users'], 10) || 0;
    const guestsCount = parseInt(countsObj['guests'], 10) || 0;

    return {
      connectionsCount: usersCount + guestsCount,
      usersCount,
      guestsCount,
    };
  }

  async set(roomId: string, connectionId: string) {
    const key = `rooms:${roomId}:connections`;
    return this.GG.DB.Redis.hset(key, connectionId, null);
  }

  async del(roomId: string, connectionId: string) {
    const key = `rooms:${roomId}:connections`;
    return this.GG.DB.Redis.hdel(key, connectionId, null);
  }

  async incGuestsCount(roomId: string) {
    const key = `rooms:${roomId}:connectionCounts`;
    await this.GG.DB.Redis.hincrby(key, 'guests', '1');
    return this.GG.API.RoomEvents.onConnectionsCountChanged(roomId);
  }
  
  async decGuestsCount(roomId: string) {
    const key = `rooms:${roomId}:connectionCounts`;
    await this.GG.DB.Redis.hincrby(key, 'guests', '-1');
    return this.GG.API.RoomEvents.onConnectionsCountChanged(roomId);
  }
  
  async incUsersCount(roomId: string) {
    const key = `rooms:${roomId}:connectionCounts`;
    await this.GG.DB.Redis.hincrby(key, 'users', '1');
    return this.GG.API.RoomEvents.onConnectionsCountChanged(roomId);
  }
  
  async decUsersCount(roomId: string) {
    const key = `rooms:${roomId}:connectionCounts`;
    await this.GG.DB.Redis.hincrby(key, 'users', '-1');
    return this.GG.API.RoomEvents.onConnectionsCountChanged(roomId);
  }
}