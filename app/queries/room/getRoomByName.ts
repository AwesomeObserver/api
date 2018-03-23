import { broker } from 'core/broker';
import { roomAPI } from 'app/api';

export const schema = `
  getRoomByName(roomName: String!): Room
`;

export async function resolver(
  root: any,
  args: {
    roomName: string
  },
  ctx: any
) {
  const room = await roomAPI.getByName(args.roomName);

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