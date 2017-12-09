import { ConnectionEvents } from 'app/api/connection/ConnectionEvents';

export const schema = `
  logout: Boolean
`;

export async function resolver(root, args, ctx) {
  ConnectionEvents.onLogout(ctx.connectionId);
  return true;
}