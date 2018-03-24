import { broker } from 'core/broker';
import { accessAPI, roomModeWaitlistAPI } from 'app/api';

export const schema = `
  waitlistAdd(roomId: Int!, userId: Int): Boolean
`;

async function access(userId: number, roomId: number) {
  const current = await broker.call('roomUser.getOneFull', { roomId, userId });

  await accessAPI.check('waitlistAdd', current);

  const room: any = await broker.call('room.getOne', { roomId });

  if (room.waitlistLock) {
    await accessAPI.check('waitlistLockIgnore', current);
	}
}

export async function resolver(
  root: any,
  args: {
    roomId: number,
    userId: number
  },
  ctx: any
) {
  const { roomId, userId } = args;
  const currentUserId = ctx.userId;

  await access(currentUserId, roomId);
  return roomModeWaitlistAPI.add(roomId, currentUserId);
}