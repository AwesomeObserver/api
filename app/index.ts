import { broker, logger } from 'core';
import { agenda, redis } from 'core/db';
import { instanceId } from 'core/config';
import { setupConnectionService } from 'app/services/connection';
import { setupWsService } from 'app/services/wsapi';
import { setupUserService } from 'app/services/user';
import { setupUserSocialService } from 'app/services/userSocial';
import { setupRoomUserService } from 'app/services/roomUser';
import { setupRoomService } from 'app/services/room';
import { setupRoomCollectionService } from 'app/services/roomCollection';
import { setupSourceService } from 'app/services/source';
import { setupYoutubeService } from 'app/services/youtube';
import { setupSoundcloudService } from 'app/services/soundcloud';
import { setupRoomUserPlaylistService } from 'app/services/roomUserPlaylist';
import { setupRoomWaitlistService } from 'app/services/roomWaitlist';

export async function startup() {
	logger.info(`API Server is ready`);

	agenda.define('waitlistPlayEnd', (job, done) => {
		broker
			.call('roomWaitlist.endPlay', {
				roomId: job.attrs.data.roomId
			})
			.then(() => done());
	});

	agenda.start();

	const hcTimeout = 2000;

	setInterval(() => {
		redis.hset('ihc', instanceId, +new Date());
	}, 2000);

	setInterval(async () => {
		const instances = await redis.hgetall(`ihc`);

		Object.keys(instances).forEach((instanceName) => {
			const diff = +new Date() - instances[instanceName];

			if (diff > hcTimeout + 1000) {
				broker
					.call('connection.clearInstance', {
						instanceId: instanceName
					})
					.then(() => {
						redis.hdel('ihc', instanceName);
					});
			}
		});
	}, 5000);

	setupConnectionService();
	setupWsService();
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
}
