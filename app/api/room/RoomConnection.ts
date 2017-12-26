import { redis } from 'core/db';
import { roomEventsAPI } from 'app/api';

export class RoomConnectionAPI {

  async getCount(roomId: number) {
    const key = `rooms:${roomId}:connectionCounts`;
    const countsObj = await redis.hgetall(key);
    
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
    return redis.hset(key, connectionId, null);
  }

  async del(roomId: number, connectionId: string) {
    const key = `rooms:${roomId}:connections`;
    return redis.hdel(key, connectionId, null);
  }

  async incGuestsCount(roomId: number) {
    const key = `rooms:${roomId}:connectionCounts`;
    await redis.hincrby(key, 'guests', 1);
    return roomEventsAPI.onConnectionsCountChanged(roomId);
  }
  
  async decGuestsCount(roomId: number) {
    const key = `rooms:${roomId}:connectionCounts`;
    await redis.hincrby(key, 'guests', -1);
    return roomEventsAPI.onConnectionsCountChanged(roomId);
  }
  
  async incUsersCount(roomId: number) {
    const key = `rooms:${roomId}:connectionCounts`;
    await redis.hincrby(key, 'users', 1);
    return roomEventsAPI.onConnectionsCountChanged(roomId);
  }
  
  async decUsersCount(roomId: number) {
    const key = `rooms:${roomId}:connectionCounts`;
    await redis.hincrby(key, 'users', -1);
    return roomEventsAPI.onConnectionsCountChanged(roomId);
  }
}