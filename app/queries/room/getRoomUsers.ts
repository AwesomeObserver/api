import { roomUserAPI } from 'app/api';

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
  return roomUserAPI.getOnline(args.roomId);
}