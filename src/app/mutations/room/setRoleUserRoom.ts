// import { checkAccess } from 'access';
// import { getUserWithRoom } from 'api/room/user';
// import { setRole } from 'api/room/user/role';
// import type { ConnectionData } from 'types';

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
  // const { roomId, userId, role } = vars;

  // await access(vars, connectionData);

  // return setRole({
  //   userId,
  //   roomId,
  //   role,
  //   whoSetId: connectionData.userId,
  //   lastRole: 'user'
  // });
}