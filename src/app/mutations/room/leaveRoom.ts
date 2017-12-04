export const schema = `
  leaveRoom(roomId: String!): Boolean
`;

export async function resolver(root, args, ctx) {
  return true;
}