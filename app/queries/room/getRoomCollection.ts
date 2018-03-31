import { broker } from 'core';

export const schema = `
  getRoomCollection(roomId: Int!): [RoomSource]
`;

export async function resolver(
	root: any,
	args: {
		roomId: number;
	},
	ctx: any
) {
	return broker.call('roomCollection.get', { roomId: args.roomId });
}
