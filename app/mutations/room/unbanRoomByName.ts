import { accessCheck, broker } from 'core';

export const schema = `
  unbanRoomByName(roomName: String!): Boolean
`;

async function access(userId: number) {
	const current = await broker.call('user.getOne', { userId });

	await accessCheck('unbanRoom', current);
}

export async function resolver(
	root: any,
	args: {
		roomName: string;
	},
	ctx: any
) {
	const { roomName } = args;
	const userId = ctx.userId;

	await access(userId);

	return broker.call('room.unbanByName', { roomName });
}
