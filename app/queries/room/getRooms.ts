import { roomAPI } from 'app/api';

export const schema = `
  getRooms: [Room]
`;

export async function resolver(root, args, ctx) {
  return roomAPI.get();
}