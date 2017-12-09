import { Connection } from 'app/api/connection/Connection';
import { Room } from 'app/api/room/Room';

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
  const { roomId } = args;
  const userId = await Connection.getUserId(ctx.connectionId);

  // await access(vars, connectionData);

  return Room.ban(roomId, {
    whoSetBanId: userId,
    banReason: null
  });
}