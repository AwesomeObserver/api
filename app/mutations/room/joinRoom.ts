import { RoomEvents } from 'app/api/room/RoomEvents';

export const schema = `
  joinRoom(roomId: String!): Boolean
`;

export async function resolver(root, args, ctx) {
  return RoomEvents.onJoin(args.roomId, ctx.connectionId);
}