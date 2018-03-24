import { broker } from 'core/broker';
import { accessAPI } from 'app/api';

export const schema = `
  unfollowRoom(roomId: Int!): Int
`;

async function access(userId: number, roomId: number) {
  const current = await broker.call('roomUser.getOneFull', { roomId, userId });
  await accessAPI.check('unfollow', current);
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