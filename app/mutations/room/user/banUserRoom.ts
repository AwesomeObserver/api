import { broker } from 'core/broker';
import { accessAPI } from 'app/api';

export const schema = `
  banUserRoom(
    userId: Int!,
    roomId: Int!,
    reason: String
  ): Boolean
`;

async function access(
  currentUserId: number,
  userId: number,
  roomId: number
) {
  const [current, context] = await Promise.all([
    broker.call('roomUser.getOneFull', { roomId, userId: currentUserId }),
    broker.call('roomUser.getOneFull', { roomId, userId })
  ]);
  await accessAPI.check('banUserRoom', current, context);
}

export async function resolver(
  root: any,
  args: {
    userId: number,
    roomId: number,
    reason?: string
  },
  ctx: any
) {
  const { userId, roomId, reason } = args;
  const currentUserId = ctx.userId;

  await access(currentUserId, userId, roomId);
  return broker.call('roomUser.ban', { roomId, userId });
}