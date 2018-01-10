import { accessAPI, roomUserAPI, roomModeWaitlistAPI } from 'app/api';

export const schema = `
  waitlistMoveUser(
    roomId: Int!,
    lastPos: Int!,
    newPos: Int!
  ): Boolean
`;

async function access(userId: number, roomId: number) {
  const current = await roomUserAPI.getOneFull(userId, roomId);

  await accessAPI.check({ group: 'room', name: 'waitlistMoveUser' }, current);
}

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

  await access(userId, roomId);
  
  return roomModeWaitlistAPI.move(roomId, lastPos, newPos);
}