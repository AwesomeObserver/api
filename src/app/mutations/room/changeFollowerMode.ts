// import { checkAccess } from 'access';
// import { getUserWithRoom } from 'api/room/user';
// import { changeFollowerMode } from 'api/room';
// import type { ConnectionData } from 'types';

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

  return ctx.GG.API.Room.setFollowerMode(roomId, isActive);
}