export const schema = `
  joinRoom(roomId: String!): Boolean
`;

export async function resolver(root, args, ctx) {
  return true;
}