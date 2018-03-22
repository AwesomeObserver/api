import { isAfter } from 'date-fns';
import { getConnection } from 'typeorm';
import { pgClient, redis } from 'core/db';
import { broker } from 'core/broker';
import { cacheAPI } from 'app/api';
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
		await this.repository.updateById(id, data);

		const query = await pgClient.query(`
			SELECT *
			FROM "room_user"
			WHERE "id" = ${id}
		`);
		
		const res = query.rows[0];

		const key = `rooms:${res.roomId}:users:${res.userId}`;

		cacheAPI.set(key, res);

		return res;
	}

	async getByIdFromDB(userId: number, roomId: number) {
    if (!userId) {
      return null;
		}
		
    const res = await pgClient.query(`
			SELECT *
			FROM "room_user"
			WHERE "userId" = ${userId} AND "roomId" = ${roomId}
    `);

    if (res.rows.length === 0) {
      return null;
    }

    return res.rows[0];
  }

  async getById(userId: number, roomId: number) {
		const key = `rooms:${roomId}:users:${userId}`;
    let [inCache, res] = await cacheAPI.get(key);

    if (!inCache) {
      res = await this.getByIdFromDB(userId, roomId);
      cacheAPI.set(key, res);
    }

    return res;
  }

	async getPure(userId: number, roomId: number) {
		return this.repository.findOne({ userId, roomId });
	}

	async getOne(userId: number, roomId: number) {
		if (!userId || !roomId) {
      return null;
    }

    const res = await this.getById(userId, roomId);

    if (!res) {
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

    return res;
	}

	async getOneFull(userId: number, roomId: number) {
		if (!userId) {
			return null;
		}

		return Promise.all([
			broker.call('user.getOne', { userId }),
			this.getOne(userId, roomId)
		]).then(([ site, room ]) => ({
			site,
			room
		}));
	}

	async getOnline(roomId: number) {
		const connections: any = await broker.call('connection.getRoomConnections', { roomId });
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
