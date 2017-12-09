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
  const { roomId } = args;
  const userId = await ctx.GG.API.Connection.getUserId(ctx.connectionId);

  // await access(vars, connectionData);

  return ctx.GG.API.Room.ban(roomId, {
    whoSetBanId: userId,
    banReason: null
  });
}