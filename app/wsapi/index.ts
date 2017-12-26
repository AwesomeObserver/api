export * from './chat';

import * as jwt from 'jsonwebtoken';
import { PubSub } from 'core/pubsub';
import { connectionAPI } from 'app/api';
const { AUTH_KEY_SECRET } = process.env;

export async function auth(service: string, cdata) {
  const { connectionId } = cdata;
  const atoken:string = jwt.sign(connectionId, AUTH_KEY_SECRET);
  return PubSub.publish('atoken', [service, atoken], { connectionId });
}

export async function login(token: string, cdata) {
  const userId = connectionAPI.checkToken(token);
  console.log('login', userId);
  cdata.userId = userId;
}

export async function logout(token: string, cdata) {
  const userId = cdata.userId;
  console.log('logout', userId);
  cdata.userId = null;
}

export async function join(roomId: number, cdata) {
  console.log('join room', roomId);
  cdata.roomId = roomId;
}

export async function leave(data: any, cdata) {
  const roomId = cdata.roomId;
  console.log('leave room', roomId);
  cdata.roomId = null;
}
