export const schema = `
  userRoom(roomId: String!, userId: String): UserRoom
`;

export async function resolver(root, args, ctx) {
  let userId = args.userId;

  if (!userId) {
    userId = await ctx.GG.API.Connection.getUserId(ctx.connectionId);
  }
  
  return await ctx.GG.API.RoomUser.getOne(userId, args.roomId);
}