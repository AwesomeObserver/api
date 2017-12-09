import { Connection } from 'app/api/connection/Connection';
import { Room } from 'app/api/room/Room';

export const schema = `
  changeFollowerMode(
    roomId: String!,
    isActive: Boolean!
  ): Boolean
`;

// async function access(vars, connectionData) {
//   const current = await getUserWithRoom(connectionData.userId, vars.roomId);

//   checkAccess({
//     group: 'room',
//     name: 'changeFollowerMode'
//   }, current);
// }

export async function resolver(
  root,
  args: {
    roomId: string,
    isActive: boolean
  },
  ctx: any
) {
  const { roomId, isActive } = args;

  // await access(vars, connectionData);

  return Room.setFollowerMode(roomId, isActive);
}