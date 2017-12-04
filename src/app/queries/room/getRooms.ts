export const schema = `
  getRooms: [Room]
`;

export async function resolver(root, args, ctx) {
  return ctx.GG.API.Room.getRooms();
}