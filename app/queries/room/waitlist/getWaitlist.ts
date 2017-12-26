import { getTime } from 'date-fns';
import { roomModeWaitlistAPI } from 'app/api';

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

  let data = await roomModeWaitlistAPI.get(roomId);

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