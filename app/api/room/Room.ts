import { format } from 'date-fns';
import { pgClient, redis } from 'core/db';
import { getConnection } from "typeorm";
import { Room as RoomEntity } from 'app/entity/Room';
import { pubSub } from 'core/pubsub';
import {
  cacheAPI,
  connectionAPI,
  roomFollowerAPI,
  roomRoleAPI,
  roomModeWaitlistAPI
} from 'app/api';

import { RoomUser as RoomUserEntity } from 'app/entity/RoomUser';
import {
  RoomWaitlistQueue as WaitlistQueueEntity
} from 'app/entity/RoomWaitlistQueue';
import {
  RoomUserWaitlistQueue as UserWaitlistQueueEntity
} from 'app/entity/RoomUserWaitlistQueue';

export class RoomAPI {

  get repository() {
    return getConnection().getRepository(RoomEntity);
  }

  get manager() {
    return getConnection().manager;
  }

  async withData(room) {
    const [counts, followersCount] = await Promise.all([
      connectionAPI.getRoomCounts(room.id),
      roomFollowerAPI.getCount(room.id)
    ]);

    const defaultAvatar = 'https://ravepro.ams3.digitaloceanspaces.com/logo.jpg';

    return {
      ...room,
      ...counts,
      avatar: room.avatar ? room.avatar : defaultAvatar,
      followersCount
    };
  }

  async getByIdFromDB(roomId: number) {
    if (!roomId) {
      return null;
    }

    const res = await pgClient.query(`
      SELECT *
      FROM "room" r
      WHERE r.id = ${roomId}
    `);

    if (res.rows.length === 0) {
      return null;
    }

    return res.rows[0];
  }

  async getById(roomId: number) {    
    const key = `rooms:${roomId}`;
    let [inCache, res] = await cacheAPI.get(key);

    if (!inCache) {
      res = await this.getByIdFromDB(roomId);
      cacheAPI.set(key, res);
    }

    return res;
  }

  async getOne(where) {
    const room = await this.getOnePure(where);

    if (!room) {
      return null;
    }
    
    return this.withData(room);
  }

  async getOnePure(where) {
    return this.repository.findOne({ where });
  }

  async get() {
    const rooms = await this.repository.find();

    return rooms.map(room => this.withData(room));
  }

  async getByName(name: string) {
    return this.getOne({ name });
  }

  async create(name: string, title: string, userId: number) {
    let room = new RoomEntity();

    name = name.trim().toLowerCase();
    title = title.trim();

    if (!name.match(/^[a-z0-9_]+$/)) {
      throw new Error('Invalid name');
    }
    
    room.name = name;
    room.title = title;

    const roomData = await this.manager.save(room);

    await Promise.all([
      roomRoleAPI.set({
        roomId: roomData.id,
        userId,
        role: 'owner',
        whoSetRoleId: null
      }),
      roomModeWaitlistAPI.create(roomData.id)
    ]);

    return roomData;
  }

  async update(roomId: number, data) {
    await this.repository.updateById(roomId, data);
    
    const res = await this.getByIdFromDB(roomId);

		const key = `rooms:${roomId}`;

		cacheAPI.set(key, res);

		return res;
  }

  async remove(roomId) {
    // Cascade fix
    await Promise.all([
      // RoomUser
      getConnection()
      .createQueryBuilder()
      .delete()
      .from(RoomUserEntity)
      .where("roomId = :roomId", { roomId })
      .execute(),
      // RoomWaitlistQueue
      getConnection()
      .createQueryBuilder()
      .delete()
      .from(WaitlistQueueEntity)
      .where("roomId = :roomId", { roomId })
      .execute(),
      // UserWaitlistQueue
      getConnection()
      .createQueryBuilder()
      .delete()
      .from(UserWaitlistQueueEntity)
      .where("roomId = :roomId", { roomId })
      .execute()
    ]);

    return this.repository.removeById(roomId);
  }

  async ban(roomId, data) {
    
    await this.update(roomId, {
      banned: true,
      banDate: format(+new Date()),
      whoSetBanId: data.whoSetBanId,
      banReason: data.banReason
    });

    return true;
  }

  async unbanByName(roomName) {

    const room = await this.getOnePure({ name: roomName });
    
    await this.update(room.id, {
      banned: false,
      banDate: null,
      whoSetBanId: null,
      banReason: null
    });

    return true;
  }

  async setTitle(roomId: number, title: string) {
    await this.update(roomId, { title });
    
    pubSub.publish('roomTitleChanged', title, { roomId });

    return true;
  }

  async setSlowMode(roomId: number, isActive: boolean) {
    
    await this.update(roomId, {
      slowMode: isActive
    });
    
    pubSub.publish('slowModeChanged', isActive, { roomId });

    return true;
  }

  async setFollowerMode(roomId: number, isActive: boolean) {
    
    await this.update(roomId, {
      followerMode: isActive
    });
    
    pubSub.publish('followerModeChanged', isActive, { roomId });

    return true;
  }
}