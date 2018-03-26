import { SourceAPI } from 'app/api/music/Source';
import { YoutubeAPI } from 'app/api/music/services/Youtube';
import { SoundcloudAPI } from 'app/api/music/services/Soundcloud';
import { RoomWaitlistAPI } from 'app/api/room/RoomWaitlist';
import { RoomUserPlaylistAPI } from 'app/api/room/RoomUserPlaylist';

export const sourceAPI = new SourceAPI();
export const youtubeAPI = new YoutubeAPI();
export const soundcloudAPI = new SoundcloudAPI();
export const roomModeWaitlistAPI = new RoomWaitlistAPI();
export const roomModeWaitlistUserAPI = new RoomUserPlaylistAPI();