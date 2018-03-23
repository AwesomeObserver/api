import { broker } from 'core/broker';
import { accessAPI, roomModeWaitlistAPI } from 'app/api';

export const schema = `
  waitlistMoveUser(
    roomId: Int!,
    lastPos: Int!,
    newPos: Int!
  ): Boolean
`;

async function access(userId: number, roomId: number) {
  const current = await broker.call('roomUser.getOneFull', { roomId, userId });
  await accessAPI.check('waitlistMoveUser', current);
}

export async function resolver(
  root: any,
  args: {
    roomId: number,
    lastPos: number,
    newPos: number
  },
  ctx: any
) {
  const { roomId, lastPos, newPos } = args;
  const userId = ctx.userId;

  await access(userId, roomId);
  return roomModeWaitlistAPI.move(roomId, lastPos, newPos);
}