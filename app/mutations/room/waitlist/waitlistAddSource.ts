import { Access } from 'app/api/Access';
import { Connection } from 'app/api/connection/Connection';
import { Room } from 'app/api/room/Room';
import { User } from 'app/api/user/User';
import { RoomUserWaitlistQueue } from 'app/api/room/RoomUserWaitlistQueue';

export const schema = `
  waitlistAddSource(roomId: Int!, link: String!): Boolean
`;

export async function resolver(
  root: any,
  args: {
    roomId: number,
    link: string
  },
  ctx: any
) {
  const { roomId, link } = args;
  const userId = ctx.userId;
  
  return RoomUserWaitlistQueue.addFromLink(roomId, userId, link);
}