import { accessAPI, roomAPI, roomUserAPI } from 'app/api';

export const schema = `
  setRoomTitle(
    roomId: Int!,
    title: String!
  ): Boolean
`;

async function access(userId: number, roomId: number) {
  const current = await roomUserAPI.getOneFull(userId, roomId);

  await accessAPI.check({
    group: 'room',
    name: 'setRoomTitle'
  }, current);
}

export async function resolver(
  root,
  args: {
    roomId: number,
    title: string
  },
  ctx: any
) {
  const { roomId, title } = args;
  const userId = ctx.userId;

  await access(userId, roomId);

  return roomAPI.setTitle(roomId, title);
}