import { accessCheck, broker } from 'core';

export const schema = `
  collectionStart(roomId: Int!): Boolean
`;

async function access(userId: number, roomId: number) {
	const current = await broker.call('roomUser.getOneFull', {
		roomId,
		userId
	});
	await accessCheck('collectionStart', current);
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

	await access(userId, roomId);
	return broker.call('roomCollection.start', { roomId });
}
