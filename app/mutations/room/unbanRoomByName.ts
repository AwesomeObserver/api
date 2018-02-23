import { accessAPI, roomAPI, userAPI } from 'app/api';

export const schema = `
  unbanRoomByName(roomName: String!): Boolean
`;

async function access(userId: number) {
  const current = await userAPI.getById(userId);

  await accessAPI.check('unbanRoom', current);
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

  return roomAPI.unbanByName(roomName);
}