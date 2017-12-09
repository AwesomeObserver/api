import { Connection } from 'app/api/connection/Connection';
import { Room } from 'app/api/room/Room';

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

  return Room.remove(args.roomId);
}