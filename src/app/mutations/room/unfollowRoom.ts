// import { checkAccess } from 'access';
// import { getUserWithRoom } from 'api/room/user';
// import { unfollowRoom } from 'api/room/user/follower';

export const schema = `
  unfollowRoom(roomId: String!): Int
`;

// async function access(vars, connectionData) {
//   const current = await getUserWithRoom(connectionData.userId, vars.roomId);

//   checkAccess({
//     group: 'room',
//     name: 'unfollow'
//   }, current);
// }

export async function resolver(root, args, ctx) {
  const userId = await ctx.GG.API.Connection.getUserId(ctx.connectionId);

  // await access(vars, connectionData);

  await ctx.GG.API.RoomFollower.unfollow(args.roomId, userId);
  return ctx.GG.API.RoomFollower.getCount(args.roomId);
}