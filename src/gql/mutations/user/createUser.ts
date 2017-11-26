import * as crypto from 'crypto';

export const schema = `
  createUser(name: String!): Boolean
`;

export async function resolver(root, args, ctx) {
  await ctx.GG.API.User.create(args.name);

  return true;
}