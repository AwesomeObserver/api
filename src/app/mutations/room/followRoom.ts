// import { checkAccess } from 'access';
// import { getUserWithRoom } from 'api/room/user';
// import { followRoom } from 'api/room/user/follower';

export const schema = `
  followRoom(roomId: String!): Int
`;

// async function access(vars, connectionData) {
//   const current = await getUserWithRoom(connectionData.userId, vars.roomId);

//   checkAccess({
//     group: 'room',
//     name: 'follow'
//   }, current);
// }

export async function resolver(root, args, ctx) {
  const userId = await ctx.GG.API.Connection.getUserId(ctx.connectionId);

  // await access(vars, connectionData);

  await ctx.GG.API.RoomFollower.follow(args.roomId, userId);
  return ctx.GG.API.RoomFollower.getCount(args.roomId);
}