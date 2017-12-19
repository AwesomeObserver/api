import { Access } from 'app/api/Access';
import { Connection } from 'app/api/connection/Connection';
import { RoomUser } from 'app/api/room/RoomUser';
import { Room } from 'app/api/room/Room';

export const schema = `
  changeFollowerMode(
    roomId: Int!,
    isActive: Boolean!
  ): Boolean
`;

async function access(userId: number, roomId: number) {
  const current = await RoomUser.getOneFull(userId, roomId);

  await Access.check({
    group: 'room',
    name: 'changeFollowerMode'
  }, current);
}

export async function resolver(
  root: any,
  args: {
    roomId: number,
    isActive: boolean
  },
  ctx: any
) {
  const { roomId, isActive } = args;
  const userId = ctx.userId;

  await access(userId, roomId);

  return Room.setFollowerMode(roomId, isActive);
}