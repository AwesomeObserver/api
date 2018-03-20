import {
  roomUserAPI,
  accessAPI,
  roomCollectionAPI
} from 'app/api';

export const schema = `
  collectionAddSource(roomId: Int!, link: String!, useTimecode: Boolean): RoomSource
`;

async function access(userId: number, roomId: number) {
  const current = await roomUserAPI.getOneFull(userId, roomId);

  await accessAPI.check('collectionAddSource', current);
}

export async function resolver(
  root: any,
  args: {
    roomId: number,
    link: string,
    useTimecode?: boolean
  },
  ctx: any
) {
  const { roomId, link, useTimecode } = args;
  const userId = ctx.userId;

  // await access(userId);
  
  return roomCollectionAPI.addFromLink(roomId, userId, link, useTimecode);
}