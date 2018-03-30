import { accessCheck, broker } from 'core';

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
    return broker.call('roomWaitlist.kick', { roomId });
  } else {
    if (!currentUserId) {
      return null;
    }

    return broker.call('roomWaitlist.kick', { roomId, userId: currentUserId });
  }
}