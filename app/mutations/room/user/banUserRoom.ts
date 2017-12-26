import { accessAPI, roomUserAPI, roomBanAPI } from 'app/api';

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
    roomUserAPI.getOneFull(currentUserId, roomId),
    roomUserAPI.getOneFull(userId, roomId)
  ]);

  await accessAPI.check({
    group: 'room',
    name: 'banUserRoom'
  }, current, context);
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

  return roomBanAPI.ban(roomId, userId);
}