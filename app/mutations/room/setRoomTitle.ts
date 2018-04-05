import { accessCheck, broker } from 'core';

export const schema = `
  setRoomTitle(
    roomId: Int!,
    title: String!
  ): Boolean
`;

async function access(userId: number, roomId: number) {
	const current = await broker.call('roomUser.getOneFull', {
		roomId,
		userId
	});
	await accessCheck('setRoomTitle', current);
}

export async function resolver(
	root,
	args: {
		roomId: number;
		title: string;
	},
	ctx: any
) {
	const { roomId, title } = args;
	const userId = ctx.userId;

	await access(userId, roomId);
	return broker.call('room.setTitle', { roomId, title });
}
