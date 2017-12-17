import { RoomEvents } from 'app/api/room/RoomEvents';

export const schema = `
  joinRoom(roomId: Int!): Boolean
`;

export async function resolver(
  root: any,
  args: {
    roomId: number
  },
  ctx: any
) {
  // return RoomEvents.onJoin(args.roomId, ctx.connectionId);
}