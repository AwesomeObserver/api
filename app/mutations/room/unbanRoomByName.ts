import { Access } from 'app/api/Access';
import { Room } from 'app/api/room/Room';
import { User } from 'app/api/user/User';

export const schema = `
  unbanRoomByName(roomName: String!): Boolean
`;

async function access(userId: number) {
  const current = await User.getById(userId);

  await Access.check({ group: 'global', name: 'unbanRoom' }, current);
}

export async function resolver(
  root: any,
  args: {
    roomName: string
  },
  ctx: any
) {
  const { roomName } = args;
  const userId = ctx.userId;
  
  await access(userId);

  return Room.unbanByName(roomName);
}