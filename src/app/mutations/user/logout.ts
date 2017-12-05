export const schema = `
  logout: Boolean
`;

export async function resolver(root, args, ctx) {
  console.log('logout', ctx.connectionId);

  return true;
}