export const schema = `
  leaveRoom(roomId: String!): Boolean
`;

export async function resolver(root, args, ctx) {
  return ctx.GG.API.RoomEvents.onLeave(args.roomId, ctx.connectionId);
}