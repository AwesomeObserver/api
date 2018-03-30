import { accessCheck, broker } from 'core';

export const schema = `
  changeFollowerMode(
    roomId: Int!,
    isActive: Boolean!
  ): Boolean
`;

async function access(userId: number, roomId: number) {
  const current = await broker.call('roomUser.getOneFull', { roomId, userId });
  await accessCheck('changeFollowerMode', current);
}

export async function resolver(
  root: any,
  args: {
    roomId: number,
    isActive: boolean
  },
  ctx: any
) {
  const { roomId, isActive } = args;
  const userId = ctx.userId;

  await access(userId, roomId);

  return broker.call('room.setFollowerMode', { roomId, isActive });
}