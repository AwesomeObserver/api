import { Access } from 'app/api/Access';
import { RoomUser } from 'app/api/room/RoomUser';
import { RoomRole } from 'app/api/room/RoomRole';

export const schema = `
  setRoleUserRoom(
    roomId: Int!,
    userId: Int!,
    role: String!
  ): Boolean
`;

async function access(
  currentUserId: number,
  userId: number,
  roomId: number,
  role: string
) {
  const [current, context] = await Promise.all([
    RoomUser.getOneFull(currentUserId, roomId),
    RoomUser.getOneFull(userId, roomId)
  ]);

  await Access.check({
    group: 'room',
    name: 'setRoleRoom'
  }, current, context);

  switch (role) {
    case 'manager':
      return Access.check({
        group: 'room',
        name: 'setRoleRoomManager'
      }, current, context);
    case 'mod':
      return Access.check({
        group: 'room',
        name: 'setRoleRoomMod'
      }, current, context);
    case 'user':
      return Access.check({
        group: 'room',
        name: 'setRoleRoomUser'
      }, current, context);
    default:
      throw new Error('Deny');
  }
}

export async function resolver(
  root,
  args: {
    roomId: number,
    userId: number,
    role: string
  },
  ctx: any
) {
  const { roomId, userId, role } = args;
  const currentUserId = ctx.userId;

  await access(currentUserId, userId, roomId, role);

  return RoomRole.set({
    roomId,
    userId,
    role,
    whoSetId: currentUserId
  });
}