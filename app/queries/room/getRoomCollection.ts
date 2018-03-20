import { roomCollectionAPI } from 'app/api';

export const schema = `
  getRoomCollection(roomId: Int!): [RoomSource]
`;

export async function resolver(
  root: any,
  args: {
    roomId: number
  },
  ctx: any
) {
  return roomCollectionAPI.get(args.roomId);
}