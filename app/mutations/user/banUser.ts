import { accessAPI, userAPI } from 'app/api';

export const schema = `
  banUser(
    userId: Int!,
    reason: String
  ): Boolean
`;

export async function access(currentUserId: number, userId: number) {
  const [current, context] = await Promise.all([
    userAPI.getById(currentUserId),
    userAPI.getById(userId)
  ]);

  await accessAPI.check('banRoom', current, context);
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

  return userAPI.ban(userId);
}