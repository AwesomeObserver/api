import { roomAPI } from 'app/api';

export const schema = `
  getRoomUsers(roomId: Int!): [UserWithRoom]
`;

export async function resolver(
  root: any,
  args: {
    roomId: number
  },
  ctx: any
) {
  return roomAPI.getOnline(args.roomId);
}