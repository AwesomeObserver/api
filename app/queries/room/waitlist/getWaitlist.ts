import { getTime } from 'date-fns';
import {
  sourceAPI,
  userAPI,
  roomModeWaitlistAPI,
  roomModeWaitlistUserAPI,
  roomCollectionAPI
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

  const [data, playlist] = await Promise.all([
    roomModeWaitlistAPI.get(roomId),
    roomModeWaitlistUserAPI.getWithCreate(roomId, ctx.userId)
  ]);

  let sourcesIds = [];

  if (playlist) {
    sourcesIds = playlist.sources;
  }

  const sources = await Promise.all(sourcesIds.map(async (sourceData) => {
    const { sourceId, start } = roomModeWaitlistUserAPI.parse(sourceData);
    const source = await sourceAPI.getById(sourceId);
    return { source, start };
  }));

  let users = await Promise.all(data.users.map(userId => {
    return userAPI.getById(parseInt(userId, 10));
  }));

  let playData = null;

  if (data.start) {
    playData = {
      source: data.source,
      user: data.user || roomCollectionAPI.getBotData(),
      start: getTime(data.start),
      serverTime: +new Date() 
    }
  }

  users = users.map(userData => {
    if (!userData) {
      return roomCollectionAPI.getBotData();
    }

    return userData;
  });

  return {
    userPlaylist: sources,
    users,
    playData
  };
}