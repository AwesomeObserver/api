import { accessAPI, roomAPI, userAPI, roomModeWaitlistAPI } from 'app/api';

export const schema = `
  waitlistRemoveUser(roomId: Int!, userId: Int!): Boolean
`;

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

  if (!userId) {
    return false;
  }
  
  return roomModeWaitlistAPI.remove(roomId, userId);
}