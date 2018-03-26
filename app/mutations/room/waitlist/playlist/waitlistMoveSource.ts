import { accessCheck, broker } from 'core';
import { roomModeWaitlistUserAPI } from 'app/api';

export const schema = `
  waitlistMoveSource(
    roomId: Int!,
    lastPos: Int!,
    newPos: Int!
  ): Boolean
`;

async function access(userId: number) {
  const current = await broker.call('user.getOne', { userId });

  await accessCheck('waitlistMoveSource', current);
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

  await access(userId);
  
  return roomModeWaitlistUserAPI.move(roomId, userId, lastPos, newPos);
}