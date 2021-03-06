import * as crypto from 'crypto';
import * as addSeconds from 'date-fns/add_seconds';
import * as isBefore from 'date-fns/is_before';
import { accessCheck, actionTime, broker, pubSub } from 'core';

export const schema = `
	createRoomMessage(
    roomId: Int!,
    message: String!
  ): Boolean
`;

async function access(roomId: number, current) {
	const userId = current.site.id;

	await accessCheck('sendMessage', current);

	const room: any = await broker.call('room.getOne', { roomId });

	// Slow Mode
	if (room.slowMode) {
		try {
			accessCheck('sendMessageSlowModeIgnore', current);
		} catch (error) {
			const actionName = `sendMessage:${roomId}`;
			const lastMessageDate = await actionTime.get(userId, actionName);

			const sendMessageDelay = 10;

			if (
				isBefore(
					+new Date(),
					addSeconds(lastMessageDate, sendMessageDelay)
				)
			) {
				throw new Error('denyForSlowMode');
			}
		}
	}

	// Follower Mode
	if (room.followerMode) {
		try {
			accessCheck('sendMessageFollowerModeIgnore', current);
		} catch (error) {
			const { follower, lastFollowDate } = current.room;

			if (!follower) {
				throw new Error('mustBeFollow');
			}

			if (!isBefore(addSeconds(lastFollowDate, 60 * 5), +new Date())) {
				throw new Error('denyForFollowMode');
			}
		}
	}
}

export async function resolver(
	root: any,
	args: {
		roomId: number;
		message: string;
	},
	ctx: any
) {
	const { roomId, message } = args;
	const { userId } = ctx;

	if (!roomId) {
		throw new Error('Outside room');
	}

	const user: any = await broker.call('roomUser.getOneFull', {
		roomId,
		userId
	});
	await access(roomId, user);
	actionTime.set(userId, `sendMessage:${roomId}`);

	const messageId = crypto.randomBytes(4).toString('hex');
	const userData = [
		[user.site.id, user.site.name, user.site.role, user.site.avatar],
		[user.room.role]
	];
	const messageData = [messageId, userData, message.trim().slice(0, 320)];
	pubSub.publish('chatMessage', messageData, { roomId });
}
