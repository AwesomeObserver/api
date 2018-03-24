import { broker } from 'core/broker';
import { accessAPI, roomAPI } from 'app/api';

export const schema = `
  changeSlowMode(
    roomId: Int!,
    isActive: Boolean!
  ): Boolean
`;

async function access(userId: number, roomId: number) {
  const current = await broker.call('roomUser.getOneFull', { roomId, userId });
  await accessAPI.check('changeSlowMode', current);
}

export async function resolver(
  root,
  args: {
    roomId: number,
    isActive: boolean
  },
  ctx: any
) {
  const { roomId, isActive } = args;
  const userId = ctx.userId;

  await access(userId, roomId);

  return broker.call('room.setSlowMode', { roomId, isActive });
}