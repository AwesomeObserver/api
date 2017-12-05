// import { checkAccess } from 'access';
// import { getUserById, banUser } from 'api/user';

export const schema = `
  banUser(
    userId: String!,
    reason: String
  ): Boolean
`;

export async function access(args, ctx) {
  // const [ current, context ] = await Promise.all([
  //   getUserById(connectionData.userId),
  //   getUserById(vars.userId)
  // ]);

  // checkAccess({
  //   group: 'global',
  //   name: 'setRole'
  // }, current, context);
}

export async function resolver(root, args, ctx) {

  // await access(vars, connectionData);

  // return banUser({
  //   userId: vars.userId,
  //   reason: vars.reason,
  //   whoSetId: connectionData.userId
  // });
}