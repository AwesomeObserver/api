import { Access } from 'app/api/Access';
import { User } from 'app/api/user/User';

export const schema = `
  banUser(
    userId: Int!,
    reason: String
  ): Boolean
`;

export async function access(currentUserId: number, userId: number) {
  const [current, context] = await Promise.all([
    User.getById(currentUserId),
    User.getById(userId)
  ]);

  await Access.check({ group: 'global', name: 'banRoom' }, current, context);
}

export async function resolver(
  root: any,
  args: {
    userId: number,
    reason?: string
  },
  ctx: any
) {
  const { userId } = args;
  const currentUserId = ctx.userId;
  
  await access(currentUserId, userId);

  return User.ban(userId);
}