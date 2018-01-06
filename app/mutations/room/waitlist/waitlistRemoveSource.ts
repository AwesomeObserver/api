import { accessAPI, roomAPI, userAPI, roomModeWaitlistUserAPI } from 'app/api';

export const schema = `
  waitlistRemoveSource(roomId: Int!, sourceId: Int!): Boolean
`;

export async function resolver(
  root: any,
  args: {
    roomId: number,
    sourceId: number
  },
  ctx: any
) {
  const { roomId, sourceId } = args;
  const userId = ctx.userId;

  if (!userId) {
    return false;
  }
  
  return roomModeWaitlistUserAPI.remove(roomId, userId, sourceId);
}