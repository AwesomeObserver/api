import { Access } from 'app/api/Access';
import { Connection } from 'app/api/connection/Connection';
import { RoomUser } from 'app/api/room/RoomUser';
import { RoomFollower } from 'app/api/room/RoomFollower';

export const schema = `
  followRoom(roomId: Int!): Int
`;

async function access(userId: number, roomId: number) {
  const current = await RoomUser.getOneFull(userId, roomId);

  await Access.check({
    group: 'room',
    name: 'follow'
  }, current);
}

export async function resolver(
  root: any,
  args: {
    roomId: number
  },
  ctx: any
) {
  const { roomId } = args;
  const userId = await Connection.getUserId(ctx.connectionId);

  await access(userId, roomId);

  await RoomFollower.follow(roomId, userId);
  return RoomFollower.getCount(roomId);
}