import { accessAPI, roomAPI, userAPI, roomModeWaitlistUserAPI } from 'app/api';

export const schema = `
  waitlistMoveSource(
    roomId: Int!,
    lastPos: Int!,
    newPos: Int!
  ): Boolean
`;

export async function resolver(
  root: any,
  args: {
    roomId: number,
    lastPos: number,
    newPos: number
  },
  ctx: any
) {
  const { roomId, lastPos, newPos } = args;
  const userId = ctx.userId;
  
  return roomModeWaitlistUserAPI.move(roomId, userId, lastPos, newPos);
}