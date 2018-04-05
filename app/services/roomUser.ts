import { Service, Action, BaseSchema } from 'moleculer-decorators';
import { format } from 'date-fns';
import { getManager, getRepository, getConnection } from 'typeorm';
import { broker, logger, pubSub } from 'core';
import { RoomUser as RoomUserEntity } from 'app/entity/RoomUser';

export const setupRoomUserService = () => {
	const repository = getRepository(RoomUserEntity);
	const manager = getManager();

	@Service({
		name: 'roomUser'
	})
	class RoomUserService extends BaseSchema {
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
		async getOne(ctx) {
			const { roomId, userId } = ctx.params;
			if (!roomId || !userId) return null;
			let userRoom = await repository.findOne({ roomId, userId });

			if (!userRoom) {
				return {
					userId,
					roomId,
					follower: false,
					firstFollowDate: null,
					lastUnfollowDate: null,
					role: 'user',
					whoSetRoleId: null,
					lastRole: 'user',
					banned: false,
					banDate: null,
					unbanDate: null,
					whoSetBanId: null,
					banReason: null
				};
			}

			return userRoom;
		}

		@Action()
		async getOneFull(ctx) {
			const { roomId, userId } = ctx.params;
			if (!roomId || !userId) return null;
			return Promise.all([
				broker.call('user.getOne', { userId }),
				broker.call('roomUser.getOne', { userId, roomId })
			]).then(([site, room]) => ({ site, room }));
		}

		@Action()
		async create(ctx) {
			const { userData } = ctx.params;
			let roomUser = new RoomUserEntity();

			if (typeof userData == 'object') {
				for (const name of Object.keys(userData)) {
					roomUser[name] = userData[name];
				}
			}

			return manager.save(roomUser);
		}

		@Action()
		async update(ctx) {
			const { roomId, userId, data } = ctx.params;
			const userRoom = await repository.findOne({ roomId, userId });

			if (!userRoom) {
				await broker.call('roomUser.create', {
					userData: {
						userId,
						roomId,
						...data
					}
				});
			} else {
				await repository.updateById(userRoom.id, data);
			}

			await broker.cacher.del(`roomUser.getOne:${roomId}|${userId}`);
			return broker.call('roomUser.getOne', { roomId, userId });
		}

		// Role
		@Action()
		async setRole(ctx) {
			const { roleData } = ctx.params;
			const { userId, roomId } = roleData;
			const data: any = await broker.call('roomUser.getOne', {
				userId,
				roomId
			});

			if (data) {
				if (data.role == roleData.role) return true;

				const res = await broker.call('roomUser.update', {
					userId,
					roomId,
					data: {
						role: roleData.role,
						lastRole: data.role
					}
				});
				pubSub.publish('roomUserRoleChanged', roleData.role, {
					userId,
					roomId
				});
				return res;
			}

			const res = await broker.call('roomUser.create', {
				userData: roleData
			});
			pubSub.publish('roomUserRoleChanged', roleData.role, {
				userId,
				roomId
			});
			return res;
		}

		// Bans
		@Action()
		async getBans(ctx) {
			const { roomId } = ctx.params;
			let data = await repository.find({
				where: {
					roomId,
					banned: true
				},
				take: 100
			});

			return Promise.all(
				data.map(async (userRoom) => {
					const user = await broker.call('user.getOne', {
						userId: userRoom.userId
					});
					return {
						...userRoom,
						user
					};
				})
			);
		}

		@Action()
		async ban(ctx) {
			const { roomId, userId } = ctx.params;
			const data: any = await broker.call('roomUser.getOne', {
				userId,
				roomId
			});

			if (data) {
				if (data.banned) return true;

				const res = await broker.call('roomUser.update', {
					userId,
					roomId,
					data: {
						banned: true,
						banDate: format(+new Date())
					}
				});

				pubSub.publish('roomUserBanned', null, { userId, roomId });
				pubSub.publish('removeUserMessages', userId, { roomId });

				return res;
			}

			const res = await broker.call('roomUser.create', {
				userData: {
					roomId,
					userId,
					banned: true,
					banDate: format(+new Date())
				}
			});

			pubSub.publish('roomUserBanned', null, { userId, roomId });
			pubSub.publish('removeUserMessages', userId, { roomId });

			return res;
		}

		@Action()
		async unban(ctx) {
			const { roomId, userId } = ctx.params;
			const data: any = await broker.call('roomUser.getOne', {
				userId,
				roomId
			});

			if (!data.banned) return true;

			return broker.call('roomUser.update', {
				userId,
				roomId,
				data: {
					role: 'user',
					banned: false
				}
			});
		}

		// Follows
		@Action()
		async getRoomFollowersCount(ctx) {
			const { roomId } = ctx.params;
			return repository.count({ roomId, follower: true });
		}

		@Action()
		async getFollowRooms(ctx) {
			const { userId } = ctx.params;

			const userRooms = await repository
				.createQueryBuilder('roomUser')
				.where('roomUser.userId = :userId', { userId })
				.andWhere('roomUser.follower = TRUE')
				.select('room')
				.leftJoinAndSelect('roomUser.room', 'room')
				.orderBy('room.connectionsCount', 'DESC')
				.addOrderBy('room.contentTitle', 'DESC')
				.limit(10)
				.getMany();

			return userRooms.map(({ room }) => room);
		}

		@Action()
		async follow(ctx) {
			const { roomId, userId } = ctx.params;
			const data: any = await broker.call('roomUser.getOne', {
				userId,
				roomId
			});

			if (data) {
				if (data.follower) return true;

				await broker.call('roomUser.update', {
					userId,
					roomId,
					data: {
						follower: true,
						lastFollowDate: format(+new Date())
					}
				});

				const count = await broker.call(
					'roomUser.getRoomFollowersCount',
					{ roomId }
				);

				await broker.call('room.update', {
					roomId,
					data: {
						followersCount: count
					}
				});

				return count;
			}

			await broker.call('roomUser.create', {
				userData: {
					roomId: roomId,
					userId: userId,
					follower: true,
					firstFollowDate: format(+new Date()),
					lastFollowDate: format(+new Date())
				}
			});

			const count = await broker.call('roomUser.getRoomFollowersCount', {
				roomId
			});

			await broker.call('room.update', {
				roomId,
				data: {
					followersCount: count
				}
			});

			return count;
		}

		@Action()
		async unfollow(ctx) {
			const { roomId, userId } = ctx.params;
			const data: any = await broker.call('roomUser.getOne', {
				userId,
				roomId
			});

			if (!data.follower) return true;

			await broker.call('roomUser.update', {
				userId,
				roomId,
				data: {
					follower: false,
					lastUnfollowDate: format(+new Date())
				}
			});

			const count = await broker.call('roomUser.getRoomFollowersCount', {
				roomId
			});

			await broker.call('room.update', {
				roomId,
				data: {
					followersCount: count
				}
			});

			return count;
		}
	}

	return broker.createService(RoomUserService);
};
