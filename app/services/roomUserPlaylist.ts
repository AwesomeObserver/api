import { Service, Action, BaseSchema } from 'moleculer-decorators';
import { getManager, getRepository, getConnection } from 'typeorm';
import { reorder, parsePlaySource } from 'core/utils';
import { broker, pubSub, logger } from 'core';
import { RoomUserWaitlistQueue as UserWaitlistQueueEntity } from 'app/entity/RoomUserWaitlistQueue';

const removeFromArray = (array, id) => {
	return array.filter((sData) => parsePlaySource(sData).sourceId != id);
};

export const setupRoomUserPlaylistService = () => {
	const repository = getRepository(UserWaitlistQueueEntity);
	const manager = getManager();

	@Service({
		name: 'roomUserPlaylist'
	})
	class RoomUserPlaylistService extends BaseSchema {
		@Action()
		async cutFirst(ctx) {
			const { roomId, userId } = ctx.params;
			const userQueue: any = await broker.call(
				'roomUserPlaylist.getWithCreate',
				{
					roomId,
					userId
				}
			);

			if (!userQueue || userQueue.sources.length == 0) {
				return false;
			}

			const firstSource = parsePlaySource(userQueue.sources[0]);
			const sources = removeFromArray(
				userQueue.sources,
				firstSource.sourceId
			);

			await repository.updateById(userQueue.id, { sources });
			await broker.cacher.del(
				`roomUserPlaylist.getWithCreate:${roomId}|${userId}`
			);

			pubSub.publish('waitlistRemoveSource', firstSource.sourceId, {
				userId,
				roomId
			});

			return firstSource;
		}

		//@ts-ignore
		@Action({
			cache: {
				keys: ['roomId', 'userId']
			},
			params: {
				roomId: 'number',
				userId: 'number'
			}
		})
		async getWithCreate(ctx) {
			const { roomId, userId } = ctx.params;

			if (!userId || !roomId) return false;

			const userQueue = await repository.findOne({ roomId, userId });

			if (userQueue) return userQueue;

			let newUserQueue = new UserWaitlistQueueEntity();

			newUserQueue.roomId = roomId;
			newUserQueue.userId = userId;
			newUserQueue.sources = [];

			return manager.save(newUserQueue);
		}

		@Action()
		async addFromLink(ctx) {
			const { roomId, userId, link, useTimecode } = ctx.params;

			let {
				source,
				start
			}: any = await broker.call('source.addFromLink', {
				link,
				useTimecode
			});

			if (!source) {
				return false;
			}

			if (source.duration <= start) {
				start = 0;
			}

			return broker.call('roomUserPlaylist.add', {
				roomId,
				userId,
				sourceId: source.id,
				start,
				source
			});
		}

		@Action()
		async add(ctx) {
			const { roomId, userId, sourceId, start, source } = ctx.params;
			const userQueue: any = await broker.call(
				'roomUserPlaylist.getWithCreate',
				{
					roomId,
					userId
				}
			);

			if (!userQueue) {
				return null;
			}

			if (userQueue.sources.length + 1 > 50) {
				logger.info(`User ${userId} get waitlist sources limit`);
				return false;
			}

			const isExist =
				userQueue.sources.findIndex((sData) => {
					return parsePlaySource(sData).sourceId == sourceId;
				}) >= 0;

			if (isExist) {
				logger.info(`User ${userId} have source ${sourceId} now`);
				return false;
			}

			const res = await repository.updateById(userQueue.id, {
				sources: [...userQueue.sources, `${sourceId}:${start}`]
			});

			await broker.cacher.del(
				`roomUserPlaylist.getWithCreate:${roomId}|${userId}`
			);

			if (source) {
				pubSub.publish(
					'waitlistAddSource',
					{ source, start },
					{ userId, roomId }
				);
			}

			return res;
		}

		@Action()
		async move(ctx) {
			const { roomId, userId, lastPos, newPos } = ctx.params;
			const userQueue: any = await broker.call(
				'roomUserPlaylist.getWithCreate',
				{
					roomId,
					userId
				}
			);

			if (!userQueue) {
				return false;
			}

			let sources = userQueue.sources;

			if (sources.length < newPos + 1) {
				return false;
			}

			sources = reorder(userQueue.sources, lastPos, newPos);

			const res = await repository.updateById(userQueue.id, { sources });

			await broker.cacher.del(
				`roomUserPlaylist.getWithCreate:${roomId}|${userId}`
			);

			pubSub.publish(
				'waitlistMoveSource',
				{ lastPos, newPos },
				{ userId, roomId }
			);

			return res;
		}

		@Action()
		async remove(ctx) {
			const { roomId, userId, sourceId } = ctx.params;
			const userQueue: any = await broker.call(
				'roomUserPlaylist.getWithCreate',
				{
					roomId,
					userId
				}
			);

			if (!userQueue) {
				return false;
			}

			if (userQueue.sources.length == 0) {
				return false;
			}

			const res = await repository.updateById(userQueue.id, {
				sources: removeFromArray(userQueue.sources, sourceId)
			});

			await broker.cacher.del(
				`roomUserPlaylist.getWithCreate:${roomId}|${userId}`
			);

			pubSub.publish('waitlistRemoveSource', sourceId, {
				userId,
				roomId
			});

			return res;
		}
	}

	return broker.createService(RoomUserPlaylistService);
};
