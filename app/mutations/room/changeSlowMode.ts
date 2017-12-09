import { Connection } from 'app/api/connection/Connection';
import { Room } from 'app/api/room/Room';

export const schema = `
  changeSlowMode(
    roomId: String!,
    isActive: Boolean!
  ): Boolean
`;

// async function access(vars, connectionData) {
//   const current = await getUserWithRoom(connectionData.userId, vars.roomId);

//   checkAccess({
//     group: 'room',
//     name: 'changeSlowMode'
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

  return Room.setSlowMode(roomId, isActive);
}