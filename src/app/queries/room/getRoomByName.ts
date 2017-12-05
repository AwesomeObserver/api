export const schema = `
  getRoomByName(roomName: String!): Room
`;

export async function resolver(root, args, ctx) {
  const room = await ctx.GG.API.Room.getByName(args.roomName);

  if (!room) {
    throw new Error('NotFound');
  }

  const user = null; // getByConnectionId

  if (!user) {
    return room;
  }

  if (user.site.isBanned) {
    throw new Error('UserBanned');
  }

  if (user.room.isBanned) {
    throw new Error('UserRoomBanned');
  }

  return room;
}