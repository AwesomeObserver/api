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
  
  const source = data.userId === 1 ? {
    title: 'The Upbeats - Punks',
    cover: null,
    service: 'youtube',
    duration: 4 * 60 + 3,
    serviceId: 'ObEBLsYEgeg'
  } : {
    title: 'Sustance - Impulsive',
    cover: null,
    service: 'youtube',
    duration: 4 * 60 + 54,
    serviceId: 'ZLJ_nEOGwQI'
  };

  return {
    users: [],
    playData: {
      source,
      user: data.user,
      start: getTime(data.start),
      serverTime: +new Date() 
    }
  };
}