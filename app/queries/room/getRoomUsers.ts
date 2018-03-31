import { broker } from 'core';

export const schema = `
  getRoomUsers(roomId: Int!): [UserWithRoom]
`;

export async function resolver(
	root: any,
	args: {
		roomId: number;
	},
	ctx: any
) {
	const { roomId } = args;
	return broker.call('room.getOnline', { roomId });
}
