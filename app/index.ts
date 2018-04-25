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

	// const json = {
	// 	notification_type: 'payment',
	// 	purchase: {
	// 		checkout: { currency: 'USD', amount: 11 },
	// 		subscription: {
	// 			subscription_id: 777,
	// 			plan_id: 'D68pYcDk',
	// 			product_id: 33,
	// 			date_create: '2018-04-25T23:19:58+03:00',
	// 			currency: 'USD',
	// 			amount: 11
	// 		},
	// 		total: { currency: 'USD', amount: 11 }
	// 	},
	// 	user: { id: '1' },
	// 	transaction: {
	// 		id: 123,
	// 		external_id: '132',
	// 		payment_date: '2018-04-25T23:19:58+03:00',
	// 		payment_method: 26,
	// 		dry_run: 1,
	// 		agreement: 32177
	// 	},
	// 	payment_details: {
	// 		payment: { currency: 'USD', amount: 11 },
	// 		payment_method_sum: { currency: 'USD', amount: 11 },
	// 		xsolla_balance_sum: { currency: 'USD', amount: 0 },
	// 		payout: { currency: 'USD', amount: 9.81 },
	// 		xsolla_fee: { currency: 'USD', amount: 0.55 },
	// 		payment_method_fee: { currency: 'USD', amount: 0 },
	// 		vat: { currency: 'USD', amount: 0 },
	// 		sales_tax: { currency: 'USD', amount: 0 },
	// 		payout_currency_rate: '1'
	// 	}
	// };

	// const data = await fetch(`http://api:8200/xsolla`, {
	// 	method: 'POST',
	// 	body: JSON.stringify(json),
	// 	headers: {
	// 		Accept: 'application/json',
	// 		'Content-Type': 'application/json',
	// 		Authorization: 'Signature 5c6244fdbd819a3ea897a163b9f47adfe38bd1cd'
	// 	}
	// });

	// console.log(data);
}
