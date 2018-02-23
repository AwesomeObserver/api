import {
  userAPI,
  accessAPI,
  roomModeWaitlistUserAPI
} from 'app/api';

export const schema = `
  waitlistAddSource(roomId: Int!, link: String!): Boolean
`;

async function access(userId: number) {
  const current = await userAPI.getById(userId);

  await accessAPI.check('waitlistAddSource', current);
}

export async function resolver(
  root: any,
  args: {
    roomId: number,
    link: string
  },
  ctx: any
) {
  const { roomId, link } = args;
  const userId = ctx.userId;

  await access(userId);
  
  return roomModeWaitlistUserAPI.addFromLink(roomId, userId, link);
}