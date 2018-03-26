import { accessCheck, broker } from 'core';
import { roomModeWaitlistAPI } from 'app/api';

export const schema = `
  waitlistSkip(roomId: Int!): Boolean
`;

async function access(userId: number, roomId: number) {
  const current = await broker.call('roomUser.getOneFull', { roomId, userId });
  await accessCheck('waitlistSkip', current);
}

export async function resolver(
  root: any,
  args: {
    roomId: number
  },
  ctx: any
) {
  const { roomId } = args;
  const currentUserId = ctx.userId;

  await access(currentUserId, roomId);
  return roomModeWaitlistAPI.skip(roomId);
}