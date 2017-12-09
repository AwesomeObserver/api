import { Connection } from 'app/api/connection/Connection';
import { ConnectionEvents } from 'app/api/connection/ConnectionEvents';
import { User } from 'app/api/user/User';

export const schema = `
  login(token: String!): User
`;

export async function resolver(
  root: any,
  args: {
    token: string
  },
  ctx: any
) {
  const userId = await Connection.checkToken(args.token);
  const user = await User.getById(userId);

  await ConnectionEvents.onLogin(ctx.connectionId, userId);

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}