import { accessAPI, roomUserAPI, roomModeWaitlistAPI } from 'app/api';

export const schema = `
  waitlistRemoveUser(roomId: Int!, userId: Int!): Boolean
`;

async function access(userId: number, roomId: number) {
  const current = await roomUserAPI.getOneFull(userId, roomId);

  await accessAPI.check('waitlistRemoveUser', current);
}

export async function resolver(
  root: any,
  args: {
    roomId: number,
    userId: number
  },
  ctx: any
) {
  const { roomId, userId } = args;
  const contextUserId = ctx.userId;

  if (userId != contextUserId) {
    await access(contextUserId, roomId);
  }

  return roomModeWaitlistAPI.remove(roomId, userId);
}