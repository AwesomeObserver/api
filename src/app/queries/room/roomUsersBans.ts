// import { checkAccess } from 'access';
// import { getUserWithRoom } from 'api/room/user';
// import { getBans } from 'api/room/user/ban';

export const schema = `
  roomUsersBans(roomId: String!): [UserRoomBan]
`;

export async function access(vars, connectionData) {
  // const current = await getUserWithRoom(connectionData.userId, vars.roomId);

  // checkAccess({
  //   group: 'room',
  //   name: 'getRoomBans'
  // }, current);
}

export async function resolver(root, vars, connectionData) {
  // await access(vars, connectionData);

  // let bansData = await getBans(vars.roomId);

  // return bansData.map(async function(banData) {
  //   const user = await getUserWithRoom(banData.userId, vars.roomId);

  //   return Object.assign(banData, { user });
  // });

  return [];
}