import { getTime } from 'date-fns';
import {
  sourceAPI,
  roomModeWaitlistAPI,
  roomModeWaitlistUserAPI
} from 'app/api';

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
  const { userId } = ctx;

  const [data, playlist] = await Promise.all([
    roomModeWaitlistAPI.get(roomId),
    roomModeWaitlistUserAPI.getWithCreate(roomId, userId)
  ]);

  let sourcesIds = [];

  if (playlist) {
    sourcesIds = playlist.sources;
  }

  const sources = await Promise.all(sourcesIds.map(sourceId => {
    return sourceAPI.getById(sourceId);
  }));

  let playData = null;

  if (data.user) {
    playData = {
      source: data.source,
      user: data.user,
      start: getTime(data.start),
      serverTime: +new Date() 
    }
  }

  return {
    userPlaylist: sources,
    users: [],
    playData
  };
}