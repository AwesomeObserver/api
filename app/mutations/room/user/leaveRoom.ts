import { RoomEvents } from 'app/api/room/RoomEvents';

export const schema = `
  leaveRoom(roomId: Int!): Boolean
`;

export async function resolver(
  root: any,
  args: {
    roomId: number
  },
  ctx: any
) {
  return RoomEvents.onLeave(args.roomId, ctx.connectionId);
}