export const schema = `
  logout: Boolean
`;

export async function resolver(root, args, ctx) {
  ctx.GG.API.ConnectionEvents.onLogout(ctx.connectionId);
  return true;
}