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
import { setupWsService } from 'app/services/wsapi';
import { setupYoutubeService } from 'app/services/youtube';
import { broker, logger } from 'core';
import { instanceId } from 'core/config';
import { getRepository, getManager } from 'typeorm';
import { Instance as InstanceEntity } from 'app/entity/Instance';
import { RoomWaitlistQueue as RoomWaitlistQueueEntity } from 'app/entity/RoomWaitlistQueue';
import { format } from 'date-fns';

async function runInstanceWatcher() {
	const repository = getRepository(InstanceEntity);

	let instance = new InstanceEntity();
	instance.instanceId = instanceId;
	instance.lastAlive = format(+new Date());
	getManager().save(instance);

	setInterval(() => {
		repository.update({ instanceId }, { lastAlive: format(+new Date()) });
	}, 2000);

	setInterval(async () => {
		const deadInstances = await repository
			.createQueryBuilder('instance')
			.where("instance.lastAlive < now() - interval '6 seconds'")
			.getMany();

		deadInstances.forEach((deadInstance) => {
			broker
				.call('connection.clearInstance', {
					instanceId: deadInstance.instanceId
				})
				.then(() => {
					repository.delete({ instanceId: deadInstance.instanceId });
				});
		});
	}, 5000);
}

async function runTrackEndWatcher() {
	const repository = getRepository(RoomWaitlistQueueEntity);

	setInterval(async () => {
		const ends = await repository
			.createQueryBuilder('queue')
			.where('queue.end < now()')
			.getMany();

		ends.forEach((end) => {
			broker.call('roomWaitlist.endPlay', {
				roomId: end.roomId
			});
		});
	}, 1000);
}

export async function startup() {
	// Watchers
	runInstanceWatcher();
	runTrackEndWatcher();
	// Services
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

	logger.info(`API Server [${instanceId}] is ready`);
}
