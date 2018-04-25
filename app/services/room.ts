import { Service, Action, BaseSchema } from 'moleculer-decorators';
import { getConnection, getManager, getRepository } from 'typeorm';
import { format } from 'date-fns';
import { broker, pubSub } from 'core';
import { Room as RoomEntity } from 'app/entity/Room';

import { RoomUser as RoomUserEntity } from 'app/entity/RoomUser';
import { RoomWaitlistQueue as WaitlistQueueEntity } from 'app/entity/RoomWaitlistQueue';
import { RoomUserWaitlistQueue as UserWaitlistQueueEntity } from 'app/entity/RoomUserWaitlistQueue';

export const setupRoomService = () => {
	const repository = getRepository(RoomEntity);
	const manager = getManager();

	@Service({
		name: 'room'
	})
	class RoomService extends BaseSchema {
		//@ts-ignore
		@Action({
			cache: {
				keys: ['roomId']
			},
			params: {
				roomId: 'number'
			}
		})
		async getOne(ctx) {
			const { roomId } = ctx.params;

			if (!roomId) return null;

			let room = await repository.findOne({
				where: { id: roomId }
			});

			return room;
		}

		//@ts-ignore
		@Action({
			cache: {
				keys: ['roomName']
			},
			params: {
				roomName: 'string'
			}
		})
		async getOneByName(ctx) {
			const { roomName } = ctx.params;

			if (!roomName) return null;

			let room = await repository.findOne({
				where: { name: roomName }
			});

			return room;
		}

		//@ts-ignore
		@Action({
			cache: true
		})
		async getTop() {
			const rooms = await repository.find({
				order: {
					connectionsCount: 'DESC',
					followersCount: 'DESC',
					contentTitle: 'DESC'
				},
				take: 50
			});

			return rooms;
		}

		@Action()
		async create(ctx) {
			let { roomData } = ctx.params;
			let room = new RoomEntity();

			roomData.name = roomData.name.trim().toLowerCase();
			roomData.title = roomData.title.trim();

			if (!roomData.name.match(/^[a-z0-9_]+$/)) {
				throw new Error('Invalid name');
			}

			room.name = roomData.name;
			room.title = roomData.title;

			const res = await manager.save(room);

			await Promise.all([
				broker.call('roomUser.setRole', {
					roleData: {
						roomId: res.id,
						userId: roomData.userId,
						role: 'owner',
						whoSetRoleId: null
					}
				}),
				broker.call('roomWaitlist.create', { roomId: res.id })
			]);

			await broker.cacher.clean('room.getTop:*');

			return res;
		}

		@Action()
		async update(ctx) {
			const { roomId, data } = ctx.params;
			const room = await repository.findOne({ id: roomId });

			if (!room) {
				throw new Error('roomNotExist');
			}

			const roomName = room.name;

			await repository.update(roomId, data);

			await Promise.all([
				broker.cacher.clean('room.getTop:*'),
				broker.cacher.del(`room.getOne:${roomId}`),
				broker.cacher.del(`room.getOneByName:${roomName}`)
			]);

			return broker.call('room.getOne', { roomId });
		}

		// To Do fix
		@Action()
		async remove(ctx) {
			const { roomId } = ctx.params;
			const room: any = await broker.call('room.getOne', { roomId });

			if (!room) {
				throw new Error('roomNotExist');
			}

			const roomName = room.name;

			// Cascade fix
			await Promise.all([
				// RoomUser
				getConnection()
					.createQueryBuilder()
					.delete()
					.from(RoomUserEntity)
					.where('roomId = :roomId', { roomId })
					.execute(),
				// RoomWaitlistQueue
				getConnection()
					.createQueryBuilder()
					.delete()
					.from(WaitlistQueueEntity)
					.where('roomId = :roomId', { roomId })
					.execute(),
				// UserWaitlistQueue
				getConnection()
					.createQueryBuilder()
					.delete()
					.from(UserWaitlistQueueEntity)
					.where('roomId = :roomId', { roomId })
					.execute()
			]);

			await repository.remove(room);

			return Promise.all([
				broker.cacher.clean('room.getTop:*'),
				broker.cacher.del(`room.getOne:${roomId}`),
				broker.cacher.del(`room.getOneByName:${roomName}`)
			]);
		}

		@Action()
		async setContentTitle(ctx) {
			const { roomId, contentTitle } = ctx.params;
			return broker.call('room.update', {
				roomId,
				data: { contentTitle }
			});
		}

		@Action()
		async ban(ctx) {
			const { roomId, data } = ctx.params;
			await broker.call('room.update', {
				roomId,
				data: {
					banned: true,
					banDate: format(+new Date()),
					whoSetBanId: data.whoSetBanId,
					banReason: data.banReason
				}
			});

			return true;
		}

		@Action()
		async unbanByName(ctx) {
			const { roomName } = ctx.params;
			const room: any = await broker.call('room.getOneByName', {
				roomName
			});

			await broker.call('room.update', {
				roomId: room.id,
				data: {
					banned: false,
					banDate: null,
					whoSetBanId: null,
					banReason: null
				}
			});

			return true;
		}

		@Action()
		async setTitle(ctx) {
			const { roomId, title } = ctx.params;

			await broker.call('room.update', {
				roomId,
				data: {
					title
				}
			});

			pubSub.publish('roomTitleChanged', title, { roomId });

			return true;
		}

		@Action()
		async setSlowMode(ctx) {
			const { roomId, isActive } = ctx.params;

			await broker.call('room.update', {
				roomId,
				data: {
					slowMode: isActive
				}
			});

			pubSub.publish('slowModeChanged', isActive, { roomId });

			return true;
		}

		@Action()
		async setFollowerMode(ctx) {
			const { roomId, isActive } = ctx.params;

			await broker.call('room.update', {
				roomId,
				data: {
					followerMode: isActive
				}
			});

			pubSub.publish('followerModeChanged', isActive, { roomId });

			return true;
		}

		@Action()
		async setWaitlistLock(ctx) {
			const { roomId, isLock } = ctx.params;

			await broker.call('room.update', {
				roomId,
				data: {
					waitlistLock: isLock
				}
			});

			pubSub.publish('waitlistLockChanged', isLock, { roomId });

			return true;
		}

		@Action()
		async getOnline(ctx) {
			const { roomId } = ctx.params;
			const connections: any = await broker.call(
				'connection.getRoomConnections',
				{ roomId }
			);
			const usersIds = new Map();
			let users = [];

			connections.forEach(({ userId }) => {
				if (userId) {
					if (!usersIds.has(userId)) {
						usersIds.set(userId, userId);
						users.push(
							broker.call('roomUser.getOneFull', {
								roomId,
								userId
							})
						);
					}
				}
			});

			return users;
		}
	}

	return broker.createService(RoomService);
};
