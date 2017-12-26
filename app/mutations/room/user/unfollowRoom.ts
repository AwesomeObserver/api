import { accessAPI, roomUserAPI, roomFollowerAPI } from 'app/api';

export const schema = `
  unfollowRoom(roomId: Int!): Int
`;

async function access(userId: number, roomId: number) {
  const current = await roomUserAPI.getOneFull(userId, roomId);

  await accessAPI.check({
    group: 'room',
    name: 'unfollow'
  }, current);
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

  await roomFollowerAPI.unfollow(roomId, userId);
  return roomFollowerAPI.getCount(roomId);
}