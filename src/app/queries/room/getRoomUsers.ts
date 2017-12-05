// import { getUsersOnline } from 'api/room/user';

export const schema = `
  getRoomUsers(roomId: String!): [UserWithRoom]
`;

export async function resolver(root, args) {
  return [];
  // return getUsersOnline(roomId);
}