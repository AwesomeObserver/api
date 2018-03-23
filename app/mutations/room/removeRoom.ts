import { broker } from 'core/broker';
import { accessAPI, roomAPI } from 'app/api';

export const schema = `
  removeRoom(roomId: Int!): Boolean
`;

async function access(userId: number, roomId: number) {
  const current = await broker.call('roomUser.getOneFull', { roomId, userId });
  await accessAPI.check('removeRoom', current);
}

export async function resolver(
  root: any,
  args: {
    roomId: number
  },
  ctx: any
) {
  const { roomId } = args;
  const userId = ctx.userId;

  await access(userId, roomId);
  return roomAPI.remove(args.roomId);
}