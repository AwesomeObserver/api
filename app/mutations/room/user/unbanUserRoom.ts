import { accessCheck, broker } from 'core';

export const schema = `
  unbanUserRoom(
    userId: Int!,
    roomId: Int!
  ): Boolean
`;

async function access(userId: number, roomId: number) {
	const current = await broker.call('roomUser.getOneFull', {
		roomId,
		userId
	});
	await accessCheck('unbanUserRoom', current);
}

export async function resolver(
	root: any,
	args: {
		userId: number;
		roomId: number;
	},
	ctx: any
) {
	const { userId, roomId } = args;
	const contextUserId = ctx.userId;

	await access(contextUserId, roomId);
	return broker.call('roomUser.unban', { roomId, userId });
}
