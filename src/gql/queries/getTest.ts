export const schema = `
  getTest: String
`;

export async function resolver(root, args, { GG }) {
  const user = await GG.API.User.get(1);
  return user.name;
}