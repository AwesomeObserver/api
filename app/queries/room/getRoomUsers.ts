// import { getUsersOnline } from 'api/room/user';

export const schema = `
  getRoomUsers(roomId: String!): [UserWithRoom]
`;

export async function resolver(root, args, ctx) {
  return ctx.GG.API.RoomUser.getOnline(args.roomId);
}