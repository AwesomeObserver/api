import { Access } from 'app/api/Access';
import { Connection } from 'app/api/connection/Connection';
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
  const userId = await Connection.getUserId(ctx.connectionId);
  
  await access(userId);

  return Room.unbanByName(roomName);
}