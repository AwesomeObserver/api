export const schema = `
  unfollowRoom(roomId: String!): Boolean
`;

export async function resolver(root, args, ctx) {
  return true;
}