import { isAfter } from 'date-fns';
import { getConnection } from 'typeorm';
import { redis } from 'core/db';
import { userAPI, connectionAPI } from 'app/api';
import { RoomUser as RoomUserEntity } from 'app/entity/RoomUser';

export class RoomUserAPI {
	get repository() {
		return getConnection().getRepository(RoomUserEntity);
	}

	get manager() {
		return getConnection().manager;
	}

	async count(options: Object) {
		return this.repository.count(options);
	}

	async get(options: Object) {
		return this.repository.find(options);
	}

	async create(data) {
		let roomUser = new RoomUserEntity();

		for (const name of Object.keys(data)) {
			roomUser[name] = data[name];
		}

		return this.manager.save(roomUser);
	}

	async update(id, data) {
		return this.repository.updateById(id, data);
	}

	getDefaultRoomUser(userId: number, roomId: number) {
		return {
			userId,
			roomId,
			follower: false,
			firstFollowDate: null,
			lastFollowDate: null,
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

	async getPure(userId: number, roomId: number) {
		return this.repository.findOne({ userId, roomId });
	}

	async getOne(userId: number, roomId: number) {
		let data = await this.repository.findOne({
			where: { userId, roomId }
		});

		if (!data) {
			return this.getDefaultRoomUser(userId, roomId);
		}

		return data;
	}

	async getOneFull(userId: number, roomId: number) {
		if (!userId) {
			return null;
		}

		return Promise.all([ userAPI.getById(userId), this.getOne(userId, roomId) ]).then(([ site, room ]) => ({
			site,
			room
		}));
	}

	async getOnline(roomId: number) {
		const connections = await connectionAPI.getRoomConnections(roomId);
		const usersIds = new Map();
		let users = [];

		connections.forEach(({ userId }) => {
			if (userId) {
				if (!usersIds.has(userId)) {
					usersIds.set(userId, userId);
					users.push(this.getOneFull(userId, roomId));
				}
			}
		});

		return users;
	}
}
