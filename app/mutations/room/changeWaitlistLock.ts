import { broker } from 'core/broker';
import { accessAPI, roomAPI } from 'app/api';

export const schema = `
  changeWaitlistLock(
    roomId: Int!,
    isLock: Boolean!
  ): Boolean
`;

async function access(userId: number, roomId: number) {
  const current = await broker.call('roomUser.getOneFull', { roomId, userId });
  await accessAPI.check('waitlistLock', current);
}

export async function resolver(
  root: any,
  args: {
    roomId: number,
    isLock: boolean
  },
  ctx: any
) {
  const { roomId, isLock } = args;
  const userId = ctx.userId;

  await access(userId, roomId);

  return roomAPI.setWaitlistLock(roomId, isLock);
}