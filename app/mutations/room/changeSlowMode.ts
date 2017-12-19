import { Access } from 'app/api/Access';
import { Connection } from 'app/api/connection/Connection';
import { RoomUser } from 'app/api/room/RoomUser';
import { Room } from 'app/api/room/Room';

export const schema = `
  changeSlowMode(
    roomId: Int!,
    isActive: Boolean!
  ): Boolean
`;

async function access(userId: number, roomId: number) {
  const current = await RoomUser.getOneFull(userId, roomId);

  await Access.check({
    group: 'room',
    name: 'changeSlowMode'
  }, current);
}

export async function resolver(
  root,
  args: {
    roomId: number,
    isActive: boolean
  },
  ctx: any
) {
  const { roomId, isActive } = args;
  const userId = ctx.userId;

  await access(userId, roomId);

  return Room.setSlowMode(roomId, isActive);
}