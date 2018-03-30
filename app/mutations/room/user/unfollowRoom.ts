import { accessCheck, broker } from 'core';

export const schema = `
  unfollowRoom(roomId: Int!): Int
`;

async function access(userId: number, roomId: number) {
  const current = await broker.call('roomUser.getOneFull', { roomId, userId });
  await accessCheck('unfollow', current);
}

export async function resolver(
  root: any,
  args: {
    roomId: number
  },
  ctx: any
) {
  const { roomId } = args;
  const userId = ctx.userId;
  
  await access(userId, roomId);
  return broker.call('roomUser.unfollow', { roomId, userId });
}