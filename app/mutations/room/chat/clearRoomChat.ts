import { broker, pubSub, accessCheck } from 'core';

export const schema = `
  clearRoomChat(roomId: Int!): Boolean
`;

async function access(roomId: number, current) {
	const userId = current.site.id;
	await accessCheck('removeAllMessages', current);
}

export async function resolver(
	root: any,
	args: {
		roomId: number;
	},
	ctx: any
) {
	const { roomId } = args;
	const { userId } = ctx;

	if (!roomId) {
		throw new Error('Outside room');
	}

	const user = await broker.call('roomUser.getOneFull', { roomId, userId });
	await access(roomId, user);
	pubSub.publish('clearChat', null, { roomId });
}
