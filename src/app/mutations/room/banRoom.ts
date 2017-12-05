// import { checkAccess } from 'access';
// import { getUserById } from 'api/user';
// import { banRoom } from 'api/room';
// import type { ConnectionData } from 'types';

export const schema = `
  banRoom(roomId: String!): Boolean
`;

// export async function access(
//   vars: {
//     roomId: String
//   },
//   connectionData: ConnectionData
// ) {
//   const current = await getUserById(connectionData.userId);

//   checkAccess({ group: 'global', name: 'banRoom' }, current);
// }

export async function resolver(
  root: any,
  args: {
    roomId: String
  },
  ctx
) {
  // const { roomId } = vars;
  // const { userId } = connectionData;

  // await access(vars, connectionData);

  // return banRoom(roomId, userId);
}