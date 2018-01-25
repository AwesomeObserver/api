import { redis } from 'core/db';
import { logger } from 'core/logger';
import { connectionEventsAPI, roomEventsAPI } from 'app/api';
const { AUTH_KEY_SECRET } = process.env;

export async function connect(cdata) {
	const { connectionId } = cdata;
	connectionEventsAPI.onJoin(connectionId);
}

export async function disconnect(cdata) {
	const { connectionId } = cdata;
	connectionEventsAPI.onLeave(connectionId);
}

export async function login(token: string, cdata) {
	if (cdata.token === token) {
		return false;
	}

	const tokenData = await redis.get(`connectionToken:${token}`);

	if (!tokenData) {
		logger.error('Invalid token');
		return;
	}

	redis.del(`connectionToken:${token}`);

	cdata.token = token;
	const userId = parseInt(tokenData, 10);
	cdata.userId = userId;
	connectionEventsAPI.onLogin(cdata.connectionId, userId);
}

export async function join(roomId: number, cdata) {
	if (cdata.roomId == roomId) {
		return false;
	}

	cdata.roomId = roomId;
	roomEventsAPI.onJoin(roomId, cdata.connectionId);
}

export async function leave(data: any, cdata) {
	const roomId = cdata.roomId;

	if (!roomId) {
		return false;
	}

	cdata.roomId = null;
	roomEventsAPI.onLeave(roomId, cdata.connectionId);
}