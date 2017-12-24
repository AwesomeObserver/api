// import { checkAccess } from 'access';
// import { getUserWithRoom } from 'api/room/user';
import * as getTime from 'date-fns/get_time';
import { RoomWaitlistQueue } from 'app/api/room/RoomWaitlistQueue';

export const schema = `
  getWaitlist(roomId: Int!): WaitlistPlay
`;

export async function resolver(
  root: any,
  args: {
    roomId: number
  },
  ctx: any
) {
  const { roomId } = args;

  let data = await RoomWaitlistQueue.get(roomId);

  if (!data.user) {
    return null;
  }
  
  return {
    users: [],
    playData: {
      source: data.source,
      user: data.user,
      start: getTime(data.start),
      serverTime: +new Date() 
    }
  };
}