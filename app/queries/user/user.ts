import { Connection } from 'app/api/connection/Connection';
import { ConnectionEvents } from 'app/api/connection/ConnectionEvents';
import { User } from 'app/api/user/User';

export const schema = `
  user: User
`;

export async function resolver(root: any, args: any, ctx: any) {
  const { userId } = ctx;

  if (!userId) {
    throw new Error('Deny');
  }

  const user = await User.getById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}