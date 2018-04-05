import { broker } from 'core';

export const schema = `
  getRoomByName(roomName: String!): Room
`;

export async function resolver(
	root: any,
	args: {
		roomName: string;
	},
	ctx: any
) {
	const { roomName } = args;
	const room: any = await broker.call('room.getOneByName', { roomName });

	if (!room) {
		throw new Error('NotFound');
	}

	if (room.banned) {
		throw new Error('RoomBanned');
	}

	const user: any = await broker.call('roomUser.getOneFull', {
		roomId: room.id,
		userId: ctx.userId
	});

	if (!user) {
		return room;
	}

	if (user.site.banned) {
		throw new Error('UserBanned');
	}

	if (user.room.banned) {
		throw new Error('UserRoomBanned');
	}

	return room;
}
