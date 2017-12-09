import { Redis } from 'core/db';
import { RoomEvents } from './RoomEvents';

export class RoomConnectionClass {

  async getCount(roomId: number) {
    const key = `rooms:${roomId}:connectionCounts`;
    const countsObj = await Redis.hgetall(key);
    
    const usersCount = parseInt(countsObj['users'], 10) || 0;
    const guestsCount = parseInt(countsObj['guests'], 10) || 0;

    return {
      connectionsCount: usersCount + guestsCount,
      usersCount,
      guestsCount,
    };
  }

  async set(roomId: number, connectionId: string) {
    const key = `rooms:${roomId}:connections`;
    return Redis.hset(key, connectionId, null);
  }

  async del(roomId: number, connectionId: string) {
    const key = `rooms:${roomId}:connections`;
    return Redis.hdel(key, connectionId, null);
  }

  async incGuestsCount(roomId: number) {
    const key = `rooms:${roomId}:connectionCounts`;
    await Redis.hincrby(key, 'guests', '1');
    return RoomEvents.onConnectionsCountChanged(roomId);
  }
  
  async decGuestsCount(roomId: number) {
    const key = `rooms:${roomId}:connectionCounts`;
    await Redis.hincrby(key, 'guests', '-1');
    return RoomEvents.onConnectionsCountChanged(roomId);
  }
  
  async incUsersCount(roomId: number) {
    const key = `rooms:${roomId}:connectionCounts`;
    await Redis.hincrby(key, 'users', '1');
    return RoomEvents.onConnectionsCountChanged(roomId);
  }
  
  async decUsersCount(roomId: number) {
    const key = `rooms:${roomId}:connectionCounts`;
    await Redis.hincrby(key, 'users', '-1');
    return RoomEvents.onConnectionsCountChanged(roomId);
  }
}

export const RoomConnection = new RoomConnectionClass();