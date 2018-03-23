import { broker } from 'core/broker';
import { accessAPI } from 'app/api';

export const schema = `
  followRoom(roomId: Int!): Int
`;

async function access(userId: number, roomId: number) {
  const current = await broker.call('roomUser.getOneFull', { roomId, userId });
  return accessAPI.check('follow', current);
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

  if (!await access(userId, roomId)) {
    return new Error('Deny');
  }

  await broker.call('roomUser.follow', { roomId, userId });
  return broker.call('roomUser.getRoomFollowersCount', { roomId });
}