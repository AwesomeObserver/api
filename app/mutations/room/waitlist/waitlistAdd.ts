import { accessAPI, roomAPI, userAPI, roomModeWaitlistAPI } from 'app/api';

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

  if (!currentUserId) {
    return null;
  }

  return roomModeWaitlistAPI.add(roomId, currentUserId);
}