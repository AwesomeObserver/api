import { accessAPI, roomUserAPI, roomFollowerAPI } from 'app/api';

export const schema = `
  followRoom(roomId: Int!): Int
`;

async function access(userId: number, roomId: number) {
  const current = await roomUserAPI.getOneFull(userId, roomId);

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

  await roomFollowerAPI.follow(roomId, userId);
  return roomFollowerAPI.getCount(roomId);
}