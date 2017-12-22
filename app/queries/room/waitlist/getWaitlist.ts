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

  console.log(data);

  const playData = {
    source: {
      title: 'The Upbeats - Punks',
      cover: 'https://geo-media.beatport.com/image/a9b30bb7-4cab-4a62-8df2-877ea71a3461.jpg',
      service: 'youtube',
      duration: 4 * 60 + 3,
      serviceId: 'ObEBLsYEgeg'
    },
    user: data.user,
    start: getTime(data.start),
    serverTime: +new Date() 
  };

  return {
    users: [],
    playData
  };
}