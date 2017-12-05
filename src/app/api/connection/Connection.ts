import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

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

export default class {
  GG: any;

  constructor(GG) {
    this.GG = GG;
  }

  genToken(userId: string): string {
    return jwt.sign(userId, TOKEN_SECRET);
  }

  checkToken(token: string): string {
    return jwt.verify(token, TOKEN_SECRET);
  }

  auth(connectionKey, userId) {
    const token = this.genToken(userId);

    const payload = {
      onConnectionAuth: token,
      connectionKey
    };
    
    this.GG.pubsub.publish('onConnectionAuth', payload);
  }

  onConnect(connectionParams, webSocket) {
    const connectionId = crypto.randomBytes(20).toString('hex');
    webSocket['connectionId'] = connectionId;

    this.GG.API.ConnectionEvents.onJoin(connectionId);

    return {
      GG: this.GG,
      connectionId
    };
  }

  onDisconnect(webSocket) {
    this.GG.API.ConnectionEvents.onLeave(webSocket.connectionId);
  }

  async save(connectionId: string) {
    const key = `connections:${connectionId}`;
  
    return this.GG.DB.Redis.multi()
      .hset(key, 'userId', null)
      .hset(key, 'roomId', null)
      .exec();
  }

  async getOne(connectionId: string) {
    const key = `connections:${connectionId}`;
    const connection = await this.GG.DB.Redis.hgetall(key);
  
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
    const Redis = this.GG.DB.Redis;

    Redis.multi({ pipeline: false });
  
    for (let connectionId of connectionIds) {
      Redis.hgetall(`connections:${connectionId}`);
    }
  
    let connectionsWithData = [];
  
    let connectionsData = await Redis.exec();
  
    for (let i = 0; i < connectionIds.length; i++) {
      connectionsWithData.push({
        connectionId: connectionIds[i],
        ...transformerArray(connectionsData[i][1])
      });
    }
    
    return connectionsWithData;
  }

  async del(connectionId: string) {
    return this.GG.DB.Redis.del(`connections:${connectionId}`);
  }

  async setRoomId(connectionId: string, roomId?: string) {
    const key = `connections:${connectionId}`;
    return this.GG.DB.Redis.hset(key, 'roomId', roomId);
  }

  async setUserId(connectionId: string, userId?: string) {
    const key = `connections:${connectionId}`;
    return this.GG.DB.Redis.hset(key, 'userId', userId);
  }

  async getUserId(connectionId: string) {
    const cData = await this.getOne(connectionId);
    return cData ? cData.userId : null;
  }

  async getCCountUserRoom(roomId: string, userId: string) {
    const key = `rooms:${roomId}:users:connections`;
    const count = await this.GG.DB.Redis.hget(key, userId);
    return parseInt(count, 10) || 0;
  }

  async incCCountUserRoom(roomId: string, userId: string) {
    const key = `rooms:${roomId}:users:connections`;
    return this.GG.DB.Redis.hincrby(key, userId, '1');
  }

  async decCCountUserRoom(roomId: string, userId: string) {
    const key = `rooms:${roomId}:users:connections`;
    return this.GG.DB.Redis.hincrby(key, userId, '-1');
  }
}