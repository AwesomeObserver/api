import { accessAPI, roomUserAPI, roomRoleAPI } from 'app/api';

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
    roomUserAPI.getOneFull(currentUserId, roomId),
    roomUserAPI.getOneFull(userId, roomId)
  ]);

  await accessAPI.check({
    group: 'room',
    name: 'setRoleRoom'
  }, current, context);

  switch (role) {
    case 'manager':
      return accessAPI.check({
        group: 'room',
        name: 'setRoleRoomManager'
      }, current, context);
    case 'mod':
      return accessAPI.check({
        group: 'room',
        name: 'setRoleRoomMod'
      }, current, context);
    case 'user':
      return accessAPI.check({
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

  return roomRoleAPI.set({
    roomId,
    userId,
    role,
    whoSetId: currentUserId
  });
}