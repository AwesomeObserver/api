export const schema = `
  joinRoom(roomId: String!): Boolean
`;

export async function resolver(root, args, ctx) {
  return ctx.GG.API.RoomEvents.onJoin(args.roomId, ctx.connectionId);
}