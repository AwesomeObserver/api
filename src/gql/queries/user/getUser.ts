export const schema = `
  getUser: User
`;

export async function resolver(root, args, ctx) {
  return ctx.GG.API.User.get(1);
}