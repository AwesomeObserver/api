export * from './chat';

import { redis } from 'core/db';
import { pubSub } from 'core/pubsub';
import { logger } from 'core/logger';
import { connectionAPI, connectionEventsAPI, roomEventsAPI } from 'app/api';
const { AUTH_KEY_SECRET } = process.env;

export async function connect(cdata) {
	const { connectionId } = cdata;
	// logger.info('connect', connectionId);

	connectionEventsAPI.onJoin(connectionId);
}

export async function disconnect(cdata) {
	const { connectionId } = cdata;
	// logger.info('disconnect', connectionId);

	connectionEventsAPI.onLeave(connectionId);
}

export async function login(token: string, cdata) {
	const tokenData = await redis.get(`connectionToken:${token}`);

	if (!tokenData) {
		logger.error('Invalid token');
		return;
	}

	redis.del(`connectionToken:${token}`);

	const userId = parseInt(tokenData, 10);
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
