import { accessAPI, roomAPI, roomUserAPI } from 'app/api';

export const schema = `
  changeSlowMode(
    roomId: Int!,
    isActive: Boolean!
  ): Boolean
`;

async function access(userId: number, roomId: number) {
  const current = await roomUserAPI.getOneFull(userId, roomId);

  await accessAPI.check({
    group: 'room',
    name: 'changeSlowMode'
  }, current);
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

  return roomAPI.setSlowMode(roomId, isActive);
}