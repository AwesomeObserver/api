import { accessAPI, userAPI } from 'app/api';

export const schema = `
  setRoleUser(
    userId: Int!,
    role: String!
  ): Boolean
`;

async function access(currentUserId: number, userId: number, role: string) {
  const [current, context] = await Promise.all([
    userAPI.getById(currentUserId),
    userAPI.getById(userId)
  ]);

  await accessAPI.check({
    group: 'global',
    name: 'setRole'
  }, current, context);

  switch (role) {
    case 'admin':
      return accessAPI.check({
        group: 'room',
        name: 'setRoleAdmin'
      }, current, context);
    case 'user':
      return accessAPI.check({
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
  const currentUserId = ctx.userId;

  await access(currentUserId, userId, role);

  return userAPI.setRole(userId, role);
}