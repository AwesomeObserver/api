import { Access } from 'app/api/Access';
import { Connection } from 'app/api/connection/Connection';
import { Room } from 'app/api/room/Room';
import { User } from 'app/api/user/User';
import { RoomWaitlistQueue } from 'app/api/room/RoomWaitlistQueue';

export const schema = `
  waitlistAdd(roomId: Int!, userId: Int): Boolean
`;

// async function access(userId: number) {
//   const current = await User.getById(userId);

//   await Access.check({ group: 'global', name: 'banRoom' }, current);
// }

export async function resolver(
  root: any,
  args: {
    roomId: number,
    userId: number
  },
  ctx: any
) {
  const { roomId, userId } = args;
  const currentUserId = ctx.userId;

  // await access(userId);

  return RoomWaitlistQueue.add(roomId, currentUserId);
}