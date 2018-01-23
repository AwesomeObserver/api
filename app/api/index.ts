import { ConnectionAPI } from 'app/api/connection/Connection';
import { ConnectionEventsAPI } from 'app/api/connection/ConnectionEvents';
import { SourceAPI } from 'app/api/music/Source';
import { YoutubeAPI } from 'app/api/music/services/Youtube';
import { SoundcloudAPI } from 'app/api/music/services/Soundcloud';
import { RoomAPI } from 'app/api/room/Room';
import { RoomBanAPI } from 'app/api/room/RoomBan';
import { RoomEventsAPI } from 'app/api/room/RoomEvents';
import { RoomFollowerAPI } from 'app/api/room/RoomFollower';
import { RoomRoleAPI } from 'app/api/room/RoomRole';
import { RoomUserAPI } from 'app/api/room/RoomUser';
import { RoomModeWaitlistAPI } from 'app/api/room/RoomModeWaitlist';
import { RoomModeWaitlistUserAPI } from 'app/api/room/RoomModeWaitlistUser';
import { UserAPI } from 'app/api/user/User';
import { AccessAPI } from 'app/api/Access';
import { ActionTimeAPI } from 'app/api/ActionTime';
import { CacheAPI } from 'app/api/Cache';

export const connectionAPI = new ConnectionAPI();
export const connectionEventsAPI = new ConnectionEventsAPI();
export const sourceAPI = new SourceAPI();
export const youtubeAPI = new YoutubeAPI();
export const soundcloudAPI = new SoundcloudAPI();
export const roomAPI = new RoomAPI();
export const roomBanAPI = new RoomBanAPI();
export const roomEventsAPI = new RoomEventsAPI();
export const roomFollowerAPI = new RoomFollowerAPI();
export const roomRoleAPI = new RoomRoleAPI();
export const roomUserAPI = new RoomUserAPI();
export const roomModeWaitlistAPI = new RoomModeWaitlistAPI();
export const roomModeWaitlistUserAPI = new RoomModeWaitlistUserAPI();
export const userAPI = new UserAPI();
export const accessAPI = new AccessAPI();
export const actionTimeAPI = new ActionTimeAPI();
export const cacheAPI = new CacheAPI();