import { roomFollowerAPI } from 'app/api';

export const schema = `
  getFollowRooms: [Room]
`;

export async function resolver(root, args, ctx) {
  const { userId } = ctx;

  if (!userId) {
    return [];
  }
  
  return roomFollowerAPI.getRooms(userId);
}