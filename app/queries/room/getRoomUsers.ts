import { RoomUser } from 'app/api/room/RoomUser';

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
  return RoomUser.getOnline(args.roomId);
}