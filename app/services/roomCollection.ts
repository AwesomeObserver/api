import { Service, Action, BaseSchema } from 'moleculer-decorators';
import { getConnection, getManager, getRepository } from 'typeorm';
import { format } from 'date-fns';
import { broker } from 'core/broker';
import { RoomSource as RoomSourceEntity } from 'app/entity/RoomSource';

export const setupRoomCollectionService = () => {
	const repository = getRepository(RoomSourceEntity);
	const manager = getManager();

	@Service({
		name: 'roomCollection'
	})
	class RoomCollectionService extends BaseSchema {
		@Action()
		async getNext(ctx) {
			const { roomId } = ctx.params;
			const roomSource = await repository.findOne({
				where: { roomId },
				relations: ['source'],
				order: {
					lastPlay: 'ASC'
				}
			});

			if (!roomSource) {
				return null;
			}

			repository.updateById(roomSource.id, {
				plays: roomSource.plays + 1,
				lastPlay: format(+new Date())
			});

			return roomSource;
		}

		//@ts-ignore
		@Action({
			cache: {
				keys: ['roomId']
			},
			params: {
				roomId: 'number'
			}
		})
		async get(ctx) {
			const { roomId } = ctx.params;

			return repository.find({
				where: { roomId },
				take: 100,
				relations: ['source'],
				order: {
					id: 'DESC'
				}
			});
		}

		//@ts-ignore
		@Action({
			cache: {
				keys: ['roomId']
			},
			params: {
				roomId: 'number'
			}
		})
		async getCount(ctx) {
			const { roomId } = ctx.params;
			return repository.count({ roomId });
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
			const res: any = await broker.call('roomCollection.addSource', {
				roomId,
				userId,
				sourceId: source.id
			});
			return repository.findOneById(res.id, { relations: ['source'] });
		}

		@Action()
		async addSource(ctx) {
			const { roomId, sourceId, userId } = ctx.params;

			if (await repository.findOne({ roomId, sourceId })) {
				throw new Error('collectionDuplicateSource');
			}

			let roomSource = new RoomSourceEntity();
			roomSource.roomId = roomId;
			roomSource.userId = userId;
			roomSource.sourceId = sourceId;
			roomSource.lastPlay = format(+new Date(1995, 11, 17));
			roomSource.createDate = format(+new Date());

			const res = await repository.save(roomSource);
			await Promise.all([
				broker.cacher.del(`roomCollection.get:${roomId}`),
				broker.cacher.del(`roomCollection.getCount:${roomId}`)
			]);
			const count = await broker.call('roomCollection.getCount', {
				roomId
			});

			await broker.call('room.update', {
				roomId,
				data: {
					collectionCount: count
				}
			});

			return res;
		}

		@Action()
		async removeSource(ctx) {
			const { roomId, roomSourceId } = ctx.params;
			const roomSource = await repository.findOne({
				id: roomSourceId,
				roomId
			});

			const res = await repository.remove(roomSource);
			await Promise.all([
				broker.cacher.del(`roomCollection.get:${roomId}`),
				broker.cacher.del(`roomCollection.getCount:${roomId}`)
			]);
			const count = await broker.call('roomCollection.getCount', {
				roomId
			});

			await broker.call('room.update', {
				roomId,
				data: {
					collectionCount: count
				}
			});

			return res;
		}

		@Action()
		async start(ctx) {
			const { roomId } = ctx.params;
			return broker.call('roomWaitlist.add', { roomId, userId: 0 });
		}

		@Action()
		getBotData() {
			return {
				id: 0,
				name: 'Collection Bot'
			};
		}
	}

	return broker.createService(RoomCollectionService);
};
