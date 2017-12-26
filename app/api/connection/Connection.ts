import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

import { redis } from 'core/db';
import { pubSub } from 'core/pubsub';
import { connectionEventsAPI } from 'app/api';

const {
  TOKEN_SECRET,
  AUTH_KEY_SECRET
} = process.env;

// Utils
function transformerArray(array) {
  let obj = {};

  for (var i = 0; i < array.length; i += 2) {
    obj[array[i]] = array[i + 1];
  }

  return obj;
}

export class ConnectionAPI {

  genToken(userId: number): string {
    return jwt.sign(`${userId}`, TOKEN_SECRET);
  }

  checkToken(token: string): number {
    const userIdStr = jwt.verify(token, TOKEN_SECRET);

    if (typeof userIdStr != 'string') {
      throw new Error('Bad format');
    }

    return parseInt(userIdStr, 10);
  }

  auth(connectionKey, userId) {
    const connectionId = jwt.verify(connectionKey, AUTH_KEY_SECRET);
    const token = this.genToken(userId);
    
    pubSub.publish('token', token, { connectionId });
  }

  onConnect(connectionParams, webSocket) {
    const connectionId = crypto.randomBytes(20).toString('hex');
    webSocket['connectionId'] = connectionId;

    connectionEventsAPI.onJoin(connectionId);

    return { connectionId };
  }

  onDisconnect(webSocket) {
    connectionEventsAPI.onLeave(webSocket.connectionId);
  }

  async save(connectionId: string) {
    const key = `connections:${connectionId}`;
  
    return redis.multi()
      .hset(key, 'userId', null)
      .hset(key, 'roomId', null)
      .exec();
  }

  async getOne(connectionId: string) {
    const key = `connections:${connectionId}`;
    const connection = await redis.hgetall(key);
  
    if (!Object.keys(connection).length) {
      return null;
    }
  
    const connectionObj = {
      userId: connection.userId,
      roomId: connection.roomId
    };
  
    return connectionObj;
  }

  async get(connectionIds: string[]) {
    redis.multi({ pipeline: false });
  
    for (let connectionId of connectionIds) {
      redis.hgetall(`connections:${connectionId}`);
    }
  
    let connectionsWithData = [];
  
    let connectionsData = await redis.exec();
  
    for (let i = 0; i < connectionIds.length; i++) {
      connectionsWithData.push({
        connectionId: connectionIds[i],
        ...transformerArray(connectionsData[i][1])
      });
    }
    
    return connectionsWithData;
  }

  async del(connectionId: string) {
    return redis.del(`connections:${connectionId}`);
  }

  async setRoomId(connectionId: string, roomId?: number) {
    const key = `connections:${connectionId}`;
    return redis.hset(key, 'roomId', roomId);
  }

  async setUserId(connectionId: string, userId?: number) {
    const key = `connections:${connectionId}`;
    return redis.hset(key, 'userId', userId);
  }

  async getUserId(connectionId: string): Promise<number|null> {
    const cData = await this.getOne(connectionId);
    return (cData && cData.userId) ? cData.userId : null;
  }

  async getCCountUserRoom(roomId: number, userId: number) {
    const key = `rooms:${roomId}:users:connections`;
    const count = await redis.hget(key, `${userId}`);
    return parseInt(count, 10) || 0;
  }

  async incCCountUserRoom(roomId: number, userId: number) {
    const key = `rooms:${roomId}:users:connections`;
    return redis.hincrby(key, `${userId}`, 1);
  }

  async decCCountUserRoom(roomId: number, userId: number) {
    const key = `rooms:${roomId}:users:connections`;
    return redis.hincrby(key, `${userId}`, -1);
  }
}