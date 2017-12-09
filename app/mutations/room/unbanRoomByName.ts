import { Connection } from 'app/api/connection/Connection';
import { Room } from 'app/api/room/Room';

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
  args: {
    roomName: string
  },
  ctx: any
) {
  const { roomName } = args;
  // const { userId } = connectionData;

  // await access(vars, connectionData);

  return Room.unbanByName(roomName);
}