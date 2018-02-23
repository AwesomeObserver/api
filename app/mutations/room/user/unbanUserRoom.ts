import { accessAPI, roomUserAPI, roomBanAPI } from 'app/api';

export const schema = `
  unbanUserRoom(
    userId: Int!,
    roomId: Int!
  ): Boolean
`;

async function access(userId: number, roomId: number) {
  const current = await roomUserAPI.getOneFull(userId, roomId);

  await accessAPI.check('unbanUserRoom', current);
}

export async function resolver(
  root: any,
  args: {
    userId: number,
    roomId: number
  },
  ctx: any
) {
  const { userId, roomId } = args;
  const contextUserId = ctx.userId;

  await access(contextUserId, roomId);

  return roomBanAPI.unban(roomId, userId);
}