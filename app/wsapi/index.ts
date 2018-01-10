export * from './chat';

import * as jwt from 'jsonwebtoken';
import { pubSub } from 'core/pubsub';
import { logger } from 'core/logger';
import { connectionAPI, connectionEventsAPI, roomEventsAPI } from 'app/api';
const { AUTH_KEY_SECRET } = process.env;

export async function connect(cdata) {
  const { connectionId } = cdata;
  // logger.info('connect', connectionId);
  
  connectionEventsAPI.onJoin(connectionId)
}

export async function disconnect(cdata) {
  const { connectionId } = cdata;
  // logger.info('disconnect', connectionId);

  connectionEventsAPI.onLeave(connectionId);
}

export async function auth(service: string, cdata) {
  const { connectionId } = cdata;
  const atoken:string = jwt.sign(connectionId, AUTH_KEY_SECRET);
  return pubSub.publish('atoken', [service, atoken], { connectionId });
}

export async function login(token: string, cdata) {
  const userId = connectionAPI.checkToken(token);
  // logger.info('login', userId);
  cdata.userId = userId;

  connectionEventsAPI.onLogin(cdata.connectionId, userId);
}

export async function logout(token: string, cdata) {
  const userId = cdata.userId;
  // logger.info('logout', userId);
  cdata.userId = null;

  connectionEventsAPI.onLogout(cdata.connectionId);
}

export async function join(roomId: number, cdata) {
  // logger.info('join room', roomId);
  cdata.roomId = roomId;

  roomEventsAPI.onJoin(roomId, cdata.connectionId);
}

export async function leave(data: any, cdata) {
  const roomId = cdata.roomId;
  // logger.info('leave room', roomId);
  cdata.roomId = null;

  roomEventsAPI.onLeave(roomId, cdata.connectionId);
}
