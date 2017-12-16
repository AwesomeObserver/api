import { Connection } from 'app/api/connection/Connection';
import { RoomUser } from 'app/api/room/RoomUser';
import { Room } from 'app/api/room/Room';

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
  const room = await Room.getByName(args.roomName);

  if (!room) {
    throw new Error('NotFound');
  }

  if (room.banned) {
    throw new Error('RoomBanned');
  }

  const userId = await Connection.getUserId(ctx.connectionId);
  const user = await RoomUser.getOneFull(userId, room.id);

  console.log(user)

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