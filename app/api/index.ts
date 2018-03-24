import { SourceAPI } from 'app/api/music/Source';
import { YoutubeAPI } from 'app/api/music/services/Youtube';
import { SoundcloudAPI } from 'app/api/music/services/Soundcloud';
import { RoomWaitlistAPI } from 'app/api/room/RoomWaitlist';
import { RoomUserPlaylistAPI } from 'app/api/room/RoomUserPlaylist';
import { RoomCollectionAPI } from 'app/api/room/RoomCollection';
import { AccessAPI } from 'app/api/Access';
import { ActionTimeAPI } from 'app/api/ActionTime';

export const sourceAPI = new SourceAPI();
export const youtubeAPI = new YoutubeAPI();
export const soundcloudAPI = new SoundcloudAPI();
export const roomModeWaitlistAPI = new RoomWaitlistAPI();
export const roomModeWaitlistUserAPI = new RoomUserPlaylistAPI();
export const roomCollectionAPI = new RoomCollectionAPI();
export const accessAPI = new AccessAPI();
export const actionTimeAPI = new ActionTimeAPI();