export const schema = `
  followRoom(roomId: String!): Boolean
`;

export async function resolver(root, args, ctx) {
  return true;
}