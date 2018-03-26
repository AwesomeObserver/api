import { accessCheck, broker } from 'core';

export const schema = `
  createRoom(
    name: String!,
    title: String!
  ): Boolean
`;

async function access(userId: number) {
  const current = await broker.call('user.getOne', { userId });
  
  await accessCheck('createRoom', current);
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

  return broker.call('room.create', {
    roomData: {
      name,
      title,
      userId
    }
  });
}