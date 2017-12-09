import { RoomEvents } from 'app/api/room/RoomEvents';

export const schema = `
  leaveRoom(roomId: String!): Boolean
`;

export async function resolver(root, args, ctx) {
  return RoomEvents.onLeave(args.roomId, ctx.connectionId);
}