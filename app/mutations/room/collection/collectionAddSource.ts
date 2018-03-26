import { accessCheck, broker } from 'core';

export const schema = `
  collectionAddSource(roomId: Int!, link: String!, useTimecode: Boolean): RoomSource
`;

async function access(userId: number, roomId: number) {
  const current = await broker.call('roomUser.getOneFull', { roomId, userId });
  await accessCheck('collectionAddSource', current);
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

  await access(userId, roomId);
  return broker.call('roomCollection.addFromLink', {
    roomId,
    userId,
    link,
    useTimecode
  });
}