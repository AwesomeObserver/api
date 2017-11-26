export const schema = `
  getUser: User
`;

export async function resolver(root, args, ctx) {
  console.log(ctx);
  return ctx.GG.API.User.get(1);
}