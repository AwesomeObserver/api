// import { onJoinRoom } from 'api/room/events';

export const schema = `
  joinRoom(roomId: String!): Boolean
`;

export async function resolver(
  root: any,
  args: {
    roomId: string
  },
  ctx: any
) {
  // const { roomId } = args;
  // const { connectionId, userId } = connectionData;
  // return onJoinRoom(roomId, connectionId, userId);
}