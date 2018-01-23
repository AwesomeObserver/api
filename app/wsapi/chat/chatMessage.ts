import * as crypto from 'crypto';
import * as addSeconds from 'date-fns/add_seconds';
import * as isBefore from 'date-fns/is_before';
import { pubSub } from 'core/pubsub';
import { accessAPI, actionTimeAPI, roomUserAPI, roomAPI } from 'app/api';

async function access(roomId: number, current) {
	const userId = current.site.id;

	await accessAPI.check(
		{
			group: 'room',
			name: 'sendMessage'
		},
		current
	);

	const room = await roomAPI.getById(roomId);

	// Slow Mode
	if (room.slowMode) {
		try {
			accessAPI.check(
				{
					group: 'room',
					name: 'sendMessageSlowModeIgnore'
				},
				current
			);
		} catch (error) {
			const actionName = `sendMessage:${roomId}`;
			const lastMessageDate = await actionTimeAPI.get(userId, actionName);

			const sendMessageDelay = 2;

			if (isBefore(+new Date(), addSeconds(lastMessageDate, sendMessageDelay))) {
				throw new Error('denyForSlowMode');
			}
		}
	}

	// Follower Mode
	if (room.followerMode) {
		try {
			accessAPI.check(
				{
					group: 'room',
					name: 'sendMessageFollowerModeIgnore'
				},
				current
			);
		} catch (error) {
			const { follower, lastFollowDate } = current.room;

			if (!follower) {
				throw new Error('mustBeFollow');
			}

			if (!isBefore(addSeconds(lastFollowDate, 60 * 30), +new Date())) {
				throw new Error('denyForFollowMode');
			}
		}
	}
}

export async function chatMessage(message: string, cdata) {
	const { roomId, userId } = cdata;

	if (!roomId) {
		throw new Error('Outside room');
	}

	const user = await roomUserAPI.getOneFull(userId, roomId);

	await access(roomId, user);

	actionTimeAPI.set(userId, `sendMessage:${roomId}`);

	const messageId = crypto.randomBytes(4).toString('hex');
	const userData = [
		[
			user.site.id,
			user.site.name,
			user.site.role,
			user.site.avatar
		],
		[
			user.room.role
		]
	];
	const messageData = [messageId, userData, message];

	pubSub.publish('chatMessage', messageData, { roomId });
}
