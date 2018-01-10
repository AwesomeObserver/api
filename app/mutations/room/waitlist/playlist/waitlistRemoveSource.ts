import { accessAPI, userAPI, roomModeWaitlistUserAPI } from 'app/api';

export const schema = `
  waitlistRemoveSource(roomId: Int!, sourceId: Int!): Boolean
`;

async function access(userId: number) {
  const current = await userAPI.getById(userId);

  await accessAPI.check({ group: 'room', name: 'waitlistRemoveSource' }, current);
}

export async function resolver(
  root: any,
  args: {
    roomId: number,
    sourceId: number
  },
  ctx: any
) {
  const { roomId, sourceId } = args;
  const userId = ctx.userId;

  await access(userId);
  
  return roomModeWaitlistUserAPI.remove(roomId, userId, sourceId);
}