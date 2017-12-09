// import { checkAccess } from 'access';
// import { getUserById } from 'api/user';
// import { removeRoom } from 'api/room';

export const schema = `
  removeRoom(roomId: String!): Boolean
`;

// export async function access(
//   vars: {
//     roomId: String
//   },
//   connectionData: ConnectionData
// ) {
//   const current = await getUserById(connectionData.userId);

//   checkAccess({ group: 'global', name: 'removeRoom' }, current);
// }

export async function resolver(root, args, ctx) {
  // const { roomId } = vars;
  // const { userId } = connectionData;
  
  // await access(vars, connectionData);

  return ctx.GG.API.Room.remove(args.roomId);
  // return removeRoom(roomId, userId);
}