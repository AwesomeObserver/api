// import { setRole } from 'api/user';
// import { checkAccess } from 'access';
// import { getUserById } from 'api/user';

export const schema = `
  setRoleUser(
    userId: String!,
    role: String!
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

  // switch (vars.role) {
  //   case 'admin':
  //     return checkAccess({
  //       group: 'room',
  //       name: 'setRoleAdmin'
  //     }, current, context);
  //   case 'user':
  //     return checkAccess({
  //       group: 'room',
  //       name: 'setRoleUser'
  //     }, current, context);
  //   default:
  //     throw new Error('Deny');
  // }
}

export async function resolver(root, args, ctx) {
  // const { userId, role } = vars;

  // await access(vars, connectionData);

  // return setRole(userId, role);
}