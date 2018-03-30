import { broker } from 'core';

export const schema = `
  userRoom(roomId: Int!, userId: Int): UserRoom
`;

export async function resolver(
  root: any,
  args: {
    roomId: number,
    userId?: number
  },
  ctx: any
) {
  let { roomId, userId } = args;

  if (!userId) {
    userId = ctx.userId;
  }
  
  return broker.call('roomUser.getOne', { roomId, userId });
}