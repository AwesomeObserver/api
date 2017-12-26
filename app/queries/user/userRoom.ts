import { roomUserAPI } from 'app/api';

export const schema = `
  userRoom(roomId: Int!, userId: Int): UserRoom
`;

export async function resolver(
  root: any,
  args: {
    roomId: number,
    userId?: number
  },
  ctx: any
) {
  let userId = args.userId;

  if (!userId) {
    userId = ctx.userId;
  }
  
  return await roomUserAPI.getOne(userId, args.roomId);
}