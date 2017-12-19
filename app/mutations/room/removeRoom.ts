import { Access } from 'app/api/Access';
import { RoomUser } from 'app/api/room/RoomUser';
import { Room } from 'app/api/room/Room';

export const schema = `
  removeRoom(roomId: Int!): Boolean
`;

async function access(userId: number, roomId: number) {
  const current = await RoomUser.getOneFull(userId, roomId);

  await Access.check({
    group: 'room',
    name: 'removeRoom'
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
  const userId = ctx.userId;

  await access(userId, roomId);


  return Room.remove(args.roomId);
}