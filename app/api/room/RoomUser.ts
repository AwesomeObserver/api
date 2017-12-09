import * as isAfter from 'date-fns/is_after';

import { TypeORMConnect, Redis } from 'core/db';
import { User } from 'app/api/user/User';
import { RoomUser as RoomUserEntity } from 'app/entity/RoomUser';

export class RoomUserClass {

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
      banDate: null,
      unbanDate: null,
      whoSetBanId: null,
      banReason: null
    };
  }

  withFormat(roomUser) {
    const unbanDate = roomUser.unbanDate;
    roomUser.banned = !!unbanDate ? isAfter(unbanDate, +new Date()) : false;
    return roomUser;
  }

  async getOne(userId: number, roomId: number) {
    const TypeORM = await TypeORMConnect;
    let userRepository = TypeORM.getRepository(RoomUserEntity);
    let data = await userRepository.findOne({ userId, roomId });

    if (!data) {
      const defaultData = this.getDefaultRoomUser(userId, roomId);
      return this.withFormat(defaultData);
    }

    return this.withFormat(data);
  }

  async getOneFull(userId: number, roomId: number) {
    return Promise.all([
      User.getById(userId),
      this.getOne(userId, roomId)
    ]).then(([ site, room ]) => ({ site, room }));
  }

  async getOnline(roomId: number) {
    const key = `rooms:${roomId}:users:connections`;
    const usersOnline = await Redis.hgetall(key);
    
    const users = [];
  
    for (const userId of Object.keys(usersOnline)) {
      if (usersOnline[userId] > 0) {
        const userIdInt = parseInt(userId, 10);
        users.push(this.getOneFull(userIdInt, roomId));
      }
    }

    return users;
  }
}

export const RoomUser = new RoomUserClass();