export const schema = `
  sendMessage(text: String!): Boolean
`;

export async function resolver() {
  return true;
}