import * as jwt from 'jsonwebtoken';
const { AUTH_KEY_SECRET } = process.env;

export const schema = `
  getConnectionAuthKey: String
`;

export async function resolver(
  root: any,
  args: any,
  ctx: any
) {
  return jwt.sign(ctx.connectionId, AUTH_KEY_SECRET);
}