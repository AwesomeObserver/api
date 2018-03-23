import { broker } from 'core/broker';
import { accessAPI, roomCollectionAPI } from 'app/api';

export const schema = `
  collectionStart(roomId: Int!): Boolean
`;

async function access(userId: number, roomId: number) {
  const current = await broker.call('roomUser.getOneFull', { roomId, userId });
  await accessAPI.check('collectionStart', current);
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
  
  return roomCollectionAPI.start(roomId);
}