import { Connection } from 'app/api/connection/Connection';
import { RoomFollower } from 'app/api/room/RoomFollower';

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
  const userId = await Connection.getUserId(ctx.connectionId);

  // await access(vars, connectionData);

  await RoomFollower.follow(args.roomId, userId);
  return RoomFollower.getCount(args.roomId);
}