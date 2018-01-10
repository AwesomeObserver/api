import {
  userAPI,
  accessAPI,
  roomModeWaitlistAPI
} from 'app/api';

export const schema = `
  waitlistAdd(roomId: Int!, userId: Int): Boolean
`;

async function access(userId: number) {
  const current = await userAPI.getById(userId);

  await accessAPI.check({ group: 'room', name: 'waitlistAdd' }, current);
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

  await access(userId);

  return roomModeWaitlistAPI.add(roomId, currentUserId);
}