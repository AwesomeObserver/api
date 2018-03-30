import { accessCheck, broker } from 'core';

export const schema = `
  waitlistRemoveSource(roomId: Int!, sourceId: Int!): Boolean
`;

async function access(userId: number) {
  const current = await broker.call('user.getOne', { userId });
  await accessCheck('waitlistRemoveSource', current);
}

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

  await access(userId);

  return broker.call('roomUserPlaylist.remove', { 
    roomId,
    userId,
    sourceId
  });
}