import { accessAPI, roomAPI, roomUserAPI } from 'app/api';

export const schema = `
  changeFollowerMode(
    roomId: Int!,
    isActive: Boolean!
  ): Boolean
`;

async function access(userId: number, roomId: number) {
  const current = await roomUserAPI.getOneFull(userId, roomId);

  await accessAPI.check('changeFollowerMode', current);
}

export async function resolver(
  root: any,
  args: {
    roomId: number,
    isActive: boolean
  },
  ctx: any
) {
  const { roomId, isActive } = args;
  const userId = ctx.userId;

  await access(userId, roomId);

  return roomAPI.setFollowerMode(roomId, isActive);
}