// import { checkAccess } from 'access';
// import { getUserById } from 'api/user';
// import { createRoom } from 'api/room';

export const schema = `
  createRoom(name: String!, title: String!): Boolean
`;

// export async function access(
//   vars: {
//     name: String,
//     title: String
//   },
//   connectionData: ConnectionData
// ) {
//   const current = await getUserById(connectionData.userId);

//   checkAccess({ group: 'global', name: 'createRoom' }, current);
// }

export async function resolver(
  root: any,
  args: {
    name: string,
    title: string
  },
  ctx: any
) {
  const { name, title } = args;
  const userId = await ctx.GG.API.Connection.getUserId(ctx.connectionId);
  // const { userId } = connectionData;
  
  // await access(args, connectionData);

  return ctx.GG.API.Room.create({ name, title }, userId);
}