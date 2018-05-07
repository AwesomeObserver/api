import { setupConnectionService } from 'app/services/connection';
import { setupRoomService } from 'app/services/room';
import { setupRoomCollectionService } from 'app/services/roomCollection';
import { setupRoomUserService } from 'app/services/roomUser';
import { setupRoomUserPlaylistService } from 'app/services/roomUserPlaylist';
import { setupRoomWaitlistService } from 'app/services/roomWaitlist';
import { setupSoundcloudService } from 'app/services/soundcloud';
import { setupSourceService } from 'app/services/source';
import { setupUserService } from 'app/services/user';
import { setupUserSocialService } from 'app/services/userSocial';
import { setupYoutubeService } from 'app/services/youtube';
import { logger } from 'core';

export async function startup() {
	setupConnectionService();
	setupUserService();
	setupUserSocialService();
	setupRoomUserService();
	setupRoomService();
	setupRoomCollectionService();
	setupSourceService();
	setupYoutubeService();
	setupSoundcloudService();
	setupRoomUserPlaylistService();
	setupRoomWaitlistService();

	logger.info(`API Server Is Ready`);
}
