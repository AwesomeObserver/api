export const schema = `
  login(token: String!): User
`;

export async function resolver(root, args, ctx) {
  const userId = await ctx.GG.API.Connection.checkToken(args.token);
  const user = await ctx.GG.API.User.getById(userId);

  ctx.GG.API.ConnectionEvents.onLogin(ctx.connectionId, userId);

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}