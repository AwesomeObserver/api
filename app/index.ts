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
import { agenda, redis } from 'core/db';

import * as fetch from 'node-fetch';

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

	function btoa(str) {
		return Buffer.from(str, 'binary').toString('base64');
	}

	const authKey = btoa(`32919:${process.env.XSOLLA_SECRET}`);

	fetch('https://api.xsolla.com/merchant/merchants/32919/token', {
		method: 'POST',
		body: JSON.stringify({
			user: {
				id: {
					value: '1'
				},
				email: {
					value: 'sygeman@gmail.com'
				}
			},
			settings: {
				project_id: 20327,
				ui: {
					theme: 'dark',
					desktop: {
						header: {
							is_visible: false
						}
					}
				}
			}
		}),
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			Authorization: `Basic ${authKey}`
		}
	})
		.then((res) => res.json())
		.then((json) => console.log(json));
}
