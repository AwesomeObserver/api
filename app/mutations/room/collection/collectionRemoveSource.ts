import { accessCheck, broker } from 'core';

export const schema = `
  collectionRemoveSource(roomId: Int!, roomSourceId: Int!): Boolean
`;

async function access(userId: number, roomId: number) {
  const current = await broker.call('roomUser.getOneFull', { roomId, userId });
  await accessCheck('collectionRemoveSource', current);
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
  return broker.call('roomCollection.removeSource', { roomId, roomSourceId });
}