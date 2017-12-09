// import { checkAccess } from 'access';
// import { getUserWithRoom } from 'api/room/user';
// import { setBanUserInRoom } from 'api/room/user/ban';
// import type { ConnectionData } from 'types';

export const schema = `
  banUserRoom(
    userId: String!,
    roomId: String!,
    reason: String
  ): Boolean
`;

// export async function access(
//   args: {
//     userId: string,
//     roomId: string,
//     reason?: string
//   },
//   ctx: any
// ) {
//   const [ current, context ] = await Promise.all([
//     getUserWithRoom(connectionData.userId, args.roomId),
//     getUserWithRoom(args.userId, args.roomId)
//   ]);

//   checkAccess({
//     group: 'room',
//     name: 'banUserRoom'
//   }, current, context);
// }

export async function resolver(
  root: any,
  args: {
    userId: string,
    roomId: string,
    reason?: string
  },
  ctx: any
) {
  // const {
  //   userId,
  //   roomId,
  //   reason
  // } = args;

  // await access(args, connectionData);

  // return setBanUserInRoom({
  //   userId,
  //   roomId,
  //   reason,
  //   whoSetId: connectionData.userId
  // });
}