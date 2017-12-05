// import { checkAccess } from 'access';
// import { getUserById } from 'api/user';
// import { unbanRoomByName } from 'api/room';

export const schema = `
  unbanRoomByName(roomName: String!): Boolean
`;

// export async function access(
//   vars: {
//     roomName: String,
//   },
//   connectionData: ConnectionData
// ) {
//   const current = await getUserById(connectionData.userId);

//   checkAccess({ group: 'global', name: 'unbanRoom' }, current);
// }

export async function resolver(
  root: any,
  vars: {
    roomName: string
  },
  ctx: any
) {
  // const { roomName } = vars;
  // const { userId } = connectionData;

  // await access(vars, connectionData);

  // return unbanRoomByName(roomName, userId);
}