import { accessCheck, broker } from 'core';
import { roomModeWaitlistAPI } from 'app/api';

export const schema = `
  waitlistKick(roomId: Int!, current: Boolean): Boolean
`;

async function access(userId: number, roomId: number) {
  const current = await broker.call('roomUser.getOneFull', { roomId, userId });
  await accessCheck('waitlistKick', current);
}

export async function resolver(
  root: any,
  args: {
    roomId: number,
    current: boolean
  },
  ctx: any
) {
  const { roomId, current } = args;
  const currentUserId = ctx.userId;

  if (current) {
    await access(currentUserId, roomId);
    return roomModeWaitlistAPI.kick(roomId);
  } else {
    if (!currentUserId) {
      return null;
    }

    return roomModeWaitlistAPI.kick(roomId, currentUserId);
  }
}