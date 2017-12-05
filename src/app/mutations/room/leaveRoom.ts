// import { onLeaveRoom } from 'api/room/events';

export const schema = `
  leaveRoom(roomId: String!): Boolean
`;

export async function resolver(
  root: any,
  vars: {
    roomId: string
  },
  ctx: any
) {
  // const { roomId } = vars;
  // const { connectionId, userId } = connectionData;
  // return onLeaveRoom(roomId, connectionId, userId);
}