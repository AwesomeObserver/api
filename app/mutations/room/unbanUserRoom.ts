import { Access } from 'app/api/Access';
import { Connection } from 'app/api/connection/Connection';
import { RoomUser } from 'app/api/room/RoomUser';
import { RoomBan } from 'app/api/room/RoomBan';

export const schema = `
  unbanUserRoom(
    userId: Int!,
    roomId: Int!
  ): Boolean
`;

async function access(userId: number, roomId: number) {
  const current = await RoomUser.getOneFull(userId, roomId);

  await Access.check({
    group: 'room',
    name: 'unbanUserRoom'
  }, current);
}

export async function resolver(
  root: any,
  args: {
    userId: number,
    roomId: number
  },
  ctx: any
) {
  const { userId, roomId } = args;

  await access(userId, roomId);

  return RoomBan.unban(roomId, userId);
}