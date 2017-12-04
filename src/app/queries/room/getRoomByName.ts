export const schema = `
  getRoomByName(roomName: String!): Room
`;

export async function resolver(root, args, ctx) {
  return ctx.GG.API.Room.getRoomByName(args.roomName);
}