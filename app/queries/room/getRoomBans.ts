import { broker } from 'core/broker';

export const schema = `
  getRoomBans(roomId: Int!): [UserRoomBan]
`;

export async function resolver(
  root: any,
  args: {
    roomId: number
  },
  ctx: any
) {
  const { roomId } = args;
  return broker.call('roomUser.getBans', { roomId });
}