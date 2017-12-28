import { accessAPI, roomAPI, userAPI } from 'app/api';

export const schema = `
  createRoom(
    name: String!,
    title: String!
  ): Boolean
`;

async function access(userId: number) {
  const current = await userAPI.getById(userId);
  
  await accessAPI.check({ group: 'global', name: 'createRoom' }, current);
}

export async function resolver(
  root: any,
  args: {
    name: string,
    title: string
  },
  ctx: any
) {
  const { name, title } = args;
  const userId = ctx.userId;
  
  await access(userId);

  return roomAPI.create(name, title, userId);
}