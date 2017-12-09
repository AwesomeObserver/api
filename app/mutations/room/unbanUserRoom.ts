// import { checkAccess } from 'access';
// import { getUserWithRoom } from 'api/room/user';
// import { unbanUserInRoom } from 'api/room/user/ban';

export const schema = `
  unbanUserRoom(
    userId: String!,
    roomId: String!
  ): Boolean
`;

// export async function access(
//   args: {
//     userId: String,
//     roomId: String
//   },
//   connectionData: ConnectionData
// ) {
//   const current = await getUserWithRoom(connectionData.userId, args.roomId);

//   checkAccess({
//     group: 'room',
//     name: 'unbanUserRoom'
//   }, current);
// }

export async function resolver(
  root: any,
  args: {
    userId: String,
    roomId: String
  },
  ctx: any
) {
  // const {
  //   userId,
  //   roomId
  // } = args;

  // await access(args, connectionData);

  // return unbanUserInRoom({
  //   userId,
  //   roomId
  // });
}