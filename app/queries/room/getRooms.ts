import { broker } from 'core/broker';

export const schema = `
  getRooms: [Room]
`;

export async function resolver(root, args, ctx) {
  return broker.call('room.getTop');
}