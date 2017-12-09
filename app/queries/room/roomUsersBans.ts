// import { checkAccess } from 'access';
// import { getUserWithRoom } from 'api/room/user';
// import { getBans } from 'api/room/user/ban';

export const schema = `
  roomUsersBans(roomId: Int!): [UserRoomBan]
`;

export async function access(args, ctx) {
  // const current = await getUserWithRoom(connectionData.userId, args.roomId);

  // checkAccess({
  //   group: 'room',
  //   name: 'getRoomBans'
  // }, current);
}

export async function resolver(
  root: any,
  args: {
    roomId: number
  },
  ctx: any
) {
  // await access(args, connectionData);

  // let bansData = await getBans(args.roomId);

  // return bansData.map(async function(banData) {
  //   const user = await getUserWithRoom(banData.userId, args.roomId);

  //   return Object.assign(banData, { user });
  // });

  return [];
}