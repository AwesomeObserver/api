import { RoomUser } from 'app/api/room/RoomUser';

export const schema = `
  getRoomUsers(roomId: String!): [UserWithRoom]
`;

export async function resolver(root, args, ctx) {
  return RoomUser.getOnline(args.roomId);
}