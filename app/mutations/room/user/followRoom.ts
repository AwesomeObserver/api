import { accessCheck, broker } from 'core';

export const schema = `
  followRoom(roomId: Int!): Int
`;

async function access(userId: number, roomId: number) {
	const current = await broker.call('roomUser.getOneFull', {
		roomId,
		userId
	});
	return accessCheck('follow', current);
}

export async function resolver(
	root: any,
	args: {
		roomId: number;
	},
	ctx: any
) {
	const { roomId } = args;
	const userId = ctx.userId;

	if (!await access(userId, roomId)) {
		return new Error('Deny');
	}

	return broker.call('roomUser.follow', { roomId, userId });
}
