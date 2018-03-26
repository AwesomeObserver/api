import { accessCheck, broker } from 'core';
import { roomModeWaitlistAPI } from 'app/api';

export const schema = `
  waitlistClear(roomId: Int!): Boolean
`;

async function access(userId: number, roomId: number) {
  const current = await broker.call('roomUser.getOneFull', { roomId, userId });
  await accessCheck('waitlistClear', current);
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
  return roomModeWaitlistAPI.clear(roomId);
}