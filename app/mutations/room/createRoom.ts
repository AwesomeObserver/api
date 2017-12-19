import { Access } from 'app/api/Access';
import { Room } from 'app/api/room/Room';
import { User } from 'app/api/user/User';

export const schema = `
  createRoom(
    name: String!,
    title: String!
  ): Boolean
`;

async function access(userId: number) {
  const current = await User.getById(userId);
  
  await Access.check({ group: 'global', name: 'createRoom' }, current);
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

  return Room.create({ name, title }, userId);
}