import { Connection } from 'app/api/connection/Connection';
import { Room } from 'app/api/room/Room';

export const schema = `
  getRooms: [Room]
`;

export async function resolver(root, args, ctx) {
  return Room.get();
}