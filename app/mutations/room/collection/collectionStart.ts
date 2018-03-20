import {
  roomUserAPI,
  accessAPI,
  roomCollectionAPI
} from 'app/api';

export const schema = `
  collectionStart(roomId: Int!): Boolean
`;

async function access(userId: number, roomId: number) {
  const current = await roomUserAPI.getOneFull(userId, roomId);

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