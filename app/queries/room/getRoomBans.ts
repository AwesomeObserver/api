// import { checkAccess } from 'access';
// import { getUserWithRoom } from 'api/room/user';
import { roomBanAPI } from 'app/api';

export const schema = `
  getRoomBans(roomId: Int!): [UserRoomBan]
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
  const { roomId } = args;

  // await access(args, connectionData);

  // let bansData = await getBans(args.roomId);

  // return bansData.map(async function(banData) {
  //   const user = await getUserWithRoom(banData.userId, args.roomId);

  //   return Object.assign(banData, { user });
  // });

  return roomBanAPI.getUsers(roomId);
}