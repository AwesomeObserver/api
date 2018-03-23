import { broker } from 'core/broker';
import { accessAPI } from 'app/api';

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
    broker.call('roomUser.getOneFull', { roomId, userId: currentUserId }),
    broker.call('roomUser.getOneFull', { roomId, userId })
  ]);

  await accessAPI.check('setRoleRoom', current, context);

  switch (role) {
    case 'manager':
      return accessAPI.check('setRoleRoomManager', current, context);
    case 'mod':
      return accessAPI.check('setRoleRoomMod', current, context);
    case 'user':
      return accessAPI.check('setRoleRoomUser', current, context);
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

  return broker.call('roomUser.setRole', {
    roleData: {
      roomId,
      userId,
      role,
      whoSetId: currentUserId
    }
  });
}