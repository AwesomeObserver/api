import { accessAPI, roomAPI, userAPI, roomModeWaitlistAPI } from 'app/api';

export const schema = `
  waitlistMoveUser(
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
  
  return roomModeWaitlistAPI.move(roomId, lastPos, newPos);
}