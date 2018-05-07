import { Service, Action, Event, BaseSchema } from 'moleculer-decorators';
import { getManager, getRepository } from 'typeorm';
import { broker, logger, pubSub } from 'core';
import { Connection as ConnectionEntity } from 'app/entity/Connection';
import { Instance as InstanceEntity } from 'app/entity/Instance';
import { format } from 'date-fns';

export const setupConnectionService = () => {
	const repository = getRepository(ConnectionEntity);
	const instanceRepository = getRepository(InstanceEntity);
	const manager = getManager();

	@Service({
		name: 'connection'
	})
	class ConnectionService extends BaseSchema {
		@Action()
		async createInstance(ctx) {
			const { instanceId } = ctx.params;
			let instance = new InstanceEntity();
			instance.instanceId = instanceId;
			instance.lastAlive = format(+new Date());
			await getManager().save(instance);
		}

		@Action()
		async instanceAlive(ctx) {
			const { instanceId } = ctx.params;
			instanceRepository.update(
				{ instanceId },
				{ lastAlive: format(+new Date()) }
			);
		}

		@Action()
		async checkInstanceAlive(ctx) {
			const deadInstances = await instanceRepository
				.createQueryBuilder('instance')
				.where("instance.lastAlive < now() - interval '6 seconds'")
				.getMany();

			deadInstances.forEach((deadInstance) => {
				broker
					.call('connection.clearInstance', {
						instanceId: deadInstance.instanceId
					})
					.then(() => {
						instanceRepository.delete({ instanceId: deadInstance.instanceId });
					});
			});
		}

		@Event()
		async 'connection.join'(ctx) {
			const { connectionId, instanceId } = ctx;
			return broker.call('connection.save', { connectionId, instanceId });
		}

		@Event()
		async 'connection.leave'(ctx) {
			const { connectionId } = ctx;
			let connection: any = await broker.call('connection.getOne', {
				connectionId
			});

			if (!connection) {
				logger.error('onLeave Error');
				return false;
			}

			const { roomId } = connection;

			if (roomId) {
				await broker.emit('connection.leaveRoom', {
					roomId,
					connectionId
				});
			}

			return broker.call('connection.del', { connectionId });
		}

		@Event()
		async 'connection.login'(ctx) {
			const { connectionId, userId } = ctx;
			let connection: any = await broker.call('connection.getOne', {
				connectionId
			});

			if (!connection) {
				logger.error('onLogin Error');
				return false;
			}

			await broker.call('connection.setUserId', { connectionId, userId });

			const { roomId } = connection;

			if (roomId) {
				await broker.call('connection.recalcRoomCount', { roomId });
			}

			return true;
		}

		@Event()
		async 'connection.joinRoom'(ctx) {
			const { connectionId, roomId } = ctx;
			const connection = await broker.call('connection.getOne', {
				connectionId
			});

			if (!connection) {
				throw new Error('Connection not found');
			}

			await broker.call('connection.setRoomId', { connectionId, roomId });
			return broker.call('connection.recalcRoomCount', { roomId });
		}

		@Event()
		async 'connection.leaveRoom'(ctx) {
			let { connectionId, roomId } = ctx;
			await broker.call('connection.setRoomId', {
				connectionId,
				roomId: null
			});
			return broker.call('connection.recalcRoomCount', { roomId });
		}

		@Action()
		async clearInstance(ctx) {
			const { instanceId } = ctx.params;
			const instanceConnections = await repository.find({ instanceId });
			const roomsIds = new Map();

			instanceConnections.forEach(({ roomId }) => {
				if (roomId && !roomsIds.has(roomId)) {
					roomsIds.set(roomId, roomId);
					broker.call('connection.recalcRoomCount', { roomId });
				}
			});

			return repository.remove(instanceConnections);
		}

		@Action()
		async recalcRoomCount(ctx) {
			const roomId = parseInt(`${ctx.params.roomId}`, 10);
			const counts: any = await broker.call('connection.getRoomCounts', {
				roomId
			});
			const { connectionsCount } = counts;
			broker.call('room.update', {
				roomId,
				data: {
					connectionsCount
				}
			});
			pubSub.publish('connectionsCountChanged', connectionsCount, {
				roomId
			});
		}

		@Action()
		async save(ctx) {
			const { connectionId, instanceId } = ctx.params;
			let connection = new ConnectionEntity();
			connection.connectionId = connectionId;
			connection.instanceId = instanceId;
			return manager.save(connection);
		}

		@Action()
		async del(ctx) {
			const { connectionId } = ctx.params;
			const connection = await repository.findOne({ connectionId });
			return repository.remove(connection);
		}

		@Action()
		async setRoomId(ctx) {
			const { connectionId, roomId } = ctx.params;
			return repository.update({ connectionId }, { roomId });
		}

		@Action()
		async setUserId(ctx) {
			const { connectionId, userId } = ctx.params;
			return repository.update({ connectionId }, { userId });
		}

		@Action()
		async getOne(ctx) {
			const { connectionId } = ctx.params;
			return repository.findOne({ connectionId });
		}

		@Action()
		async getRoomConnections(ctx) {
			const { roomId } = ctx.params;
			return repository.find({ roomId });
		}

		@Action()
		async getUserConnections(ctx) {
			const { userId } = ctx.params;
			return repository.find({ userId });
		}

		@Action()
		async getRoomCounts(ctx) {
			const { roomId } = ctx.params;
			const connections: any = await broker.call(
				'connection.getRoomConnections',
				{ roomId }
			);
			let users = new Map();
			let guestsCount = 0;

			connections.forEach((connection) => {
				if (connection.userId) {
					users.set(connection.userId, 1);
				} else {
					guestsCount++;
				}
			});

			const usersCount = users.size;

			return {
				connectionsCount: usersCount + guestsCount,
				usersCount,
				guestsCount
			};
		}
	}

	return broker.createService(ConnectionService);
};
