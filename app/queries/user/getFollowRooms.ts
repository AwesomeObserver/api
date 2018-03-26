import { broker } from 'core';

export const schema = `
  getFollowRooms: [Room]
`;

export async function resolver(root, args, ctx) {
  const { userId } = ctx;

  if (!userId) {
    return [];
  }
  
  return broker.call('roomUser.getFollowRooms', { userId });
}