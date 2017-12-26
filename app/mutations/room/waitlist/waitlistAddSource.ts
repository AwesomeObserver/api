import { accessAPI, roomAPI, userAPI, roomModeWaitlistUserAPI } from 'app/api';

export const schema = `
  waitlistAddSource(roomId: Int!, link: String!): Boolean
`;

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
  
  return roomModeWaitlistUserAPI.addFromLink(roomId, userId, link);
}