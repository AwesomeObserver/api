import { Access } from 'app/api/Access';
import { Connection } from 'app/api/connection/Connection';
import { User } from 'app/api/user/User';

export const schema = `
  setRoleUser(
    userId: Int!,
    role: String!
  ): Boolean
`;

async function access(currentUserId: number, userId: number, role: string) {
  const [current, context] = await Promise.all([
    User.getById(currentUserId),
    User.getById(userId)
  ]);

  await Access.check({
    group: 'global',
    name: 'setRole'
  }, current, context);

  switch (role) {
    case 'admin':
      return Access.check({
        group: 'room',
        name: 'setRoleAdmin'
      }, current, context);
    case 'user':
      return Access.check({
        group: 'room',
        name: 'setRoleUser'
      }, current, context);
    default:
      throw new Error('Deny');
  }
}

export async function resolver(
  root: any,
  args: {
    userId: number,
    role: string
  },
  ctx: any
) {
  const { userId, role } = args;
  const currentUserId = await Connection.getUserId(ctx.connectionId);

  await access(currentUserId, userId, role);

  return User.setRole(userId, role);
}