import { accessAPI, roomUserAPI, roomCollectionAPI } from 'app/api';

export const schema = `
  collectionRemoveSource(roomId: Int!, roomSourceId: Int!): Boolean
`;

async function access(userId: number, roomId: number) {
  const current = await roomUserAPI.getOneFull(userId, roomId);

  await accessAPI.check('collectionRemoveSource', current);
}

export async function resolver(
  root: any,
  args: {
    roomId: number,
    roomSourceId: number
  },
  ctx: any
) {
  const { roomId, roomSourceId } = args;
  const userId = ctx.userId;

  await access(userId, roomId);
  
  return roomCollectionAPI.removeSource(roomId, roomSourceId);
}