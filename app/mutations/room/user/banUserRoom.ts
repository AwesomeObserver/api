import { Access } from 'app/api/Access';
import { RoomUser } from 'app/api/room/RoomUser';
import { RoomBan } from 'app/api/room/RoomBan';

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
    RoomUser.getOneFull(currentUserId, roomId),
    RoomUser.getOneFull(userId, roomId)
  ]);

  await Access.check({
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

  return RoomBan.ban(roomId, userId);
}