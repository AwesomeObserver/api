import { accessCheck, broker } from 'core';

export const schema = `
  waitlistRemoveUser(roomId: Int!, userId: Int!): Boolean
`;

async function access(userId: number, roomId: number) {
	const current = await broker.call('roomUser.getOneFull', {
		roomId,
		userId
	});
	await accessCheck('waitlistRemoveUser', current);
}

export async function resolver(
	root: any,
	args: {
		roomId: number;
		userId: number;
	},
	ctx: any
) {
	const { roomId, userId } = args;
	const contextUserId = ctx.userId;

	if (userId != contextUserId) {
		await access(contextUserId, roomId);
	}

	return broker.call('roomWaitlist.remove', { roomId, userId });
}
