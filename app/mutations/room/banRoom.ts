import { broker } from 'core/broker';
import { accessAPI, roomAPI } from 'app/api';

export const schema = `
  banRoom(roomId: Int!): Boolean
`;

async function access(userId: number) {
  const current = await broker.call('user.getOne', { userId });

  await accessAPI.check('banRoom', current);
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

  await access(userId);

  return roomAPI.ban(roomId, {
    whoSetBanId: userId,
    banReason: null
  });
}