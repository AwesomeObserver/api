import { Connection } from 'app/api/connection/Connection';
import { RoomRole } from 'app/api/room/RoomRole';

export const schema = `
  setRoleUserRoom(
    roomId: String!,
    userId: String!,
    role: String!
  ): Boolean
`;

// async function access(vars, connectionData) {
//   const [ current, context ] = await Promise.all([
//     getUserWithRoom(connectionData.userId, vars.roomId),
//     getUserWithRoom(vars.userId, vars.roomId)
//   ]);

//   checkAccess({
//     group: 'room',
//     name: 'setRoleRoom'
//   }, current, context);

//   switch (vars.role) {
//     case 'manager':
//       return checkAccess({
//         group: 'room',
//         name: 'setRoleRoomManager'
//       }, current, context);
//     case 'mod':
//       return checkAccess({
//         group: 'room',
//         name: 'setRoleRoomMod'
//       }, current, context);
//     case 'user':
//       return checkAccess({
//         group: 'room',
//         name: 'setRoleRoomUser'
//       }, current, context);
//     default:
//       throw new Error('Deny');
//   }
// }

export async function resolver(
  root,
  args: {
    roomId: string,
    userId: string,
    role: string
  },
  ctx: any
) {
  const { roomId, userId, role } = args;
  const whoSetId = await Connection.getUserId(ctx.connectionId);

  // await access(vars, connectionData);

  return RoomRole.set({
    roomId,
    userId,
    role,
    whoSetId
  });
}