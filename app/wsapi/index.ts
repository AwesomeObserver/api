import { redis } from 'core/db';
import { logger } from 'core/logger';
import { instanceId } from 'core/config';
import { broker } from 'core/broker';

export async function connect(cdata) {
	const { connectionId } = cdata;
	broker.call("connection.join", { connectionId, instanceId });
}

export async function disconnect(cdata) {
	const { connectionId } = cdata;
	broker.call("connection.leave", { connectionId });
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
	broker.call("connection.login", {
		connectionId: cdata.connectionId,
		userId
	});
}

export async function join(roomId: number, cdata) {
	if (cdata.roomId == roomId) {
		return false;
	}

	cdata.roomId = roomId;
	broker.call("connection.joinRoom", {
		connectionId: cdata.connectionId,
		roomId
	});
}

export async function leave(data: any, cdata) {
	const roomId = cdata.roomId;

	if (!roomId) {
		return false;
	}

	cdata.roomId = null;
	broker.call("connection.leaveRoom", {
		connectionId: cdata.connectionId,
		roomId
	});
}