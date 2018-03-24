import { broker } from 'core/broker';
import { accessAPI } from 'app/api';

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

  return broker.call('room.ban', {
    roomId,
    data: {
      whoSetBanId: userId,
      banReason: null
    }
  });
}