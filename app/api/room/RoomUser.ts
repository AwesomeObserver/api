import * as isAfter from 'date-fns/is_after';

import { getConnection } from "typeorm";
import { Redis } from 'core/db';
import { User } from 'app/api/user/User';
import { RoomUser as RoomUserEntity } from 'app/entity/RoomUser';

export class RoomUserClass {

  async count(options: Object) {
    let roomUserRepository = getConnection().getRepository(RoomUserEntity);
    return roomUserRepository.count(options);
  }

  async get(options: Object) {
    let roomUserRepository = getConnection().getRepository(RoomUserEntity);
    return roomUserRepository.find(options);
  }

  async create(data) {
    let roomUser = new RoomUserEntity();
  
    for (const name of Object.keys(data) ) {
      roomUser[name] = data[name];
    }

    return getConnection().manager.save(roomUser);
  }

  async update(id, data) {
    const roomUserRepository = getConnection().getRepository(RoomUserEntity);

    return roomUserRepository.updateById(id, data);
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
    let userRepository = getConnection().getRepository(RoomUserEntity);
    return userRepository.findOne({ userId, roomId });
  }

  async getOne(userId: number, roomId: number) {
    let userRepository = getConnection().getRepository(RoomUserEntity);
    let data = await userRepository.findOne({ userId, roomId });

    if (!data) {
      return this.getDefaultRoomUser(userId, roomId);
    }

    return data;
  }

  async getOneFull(userId: number, roomId: number) {
    if (!userId) {
      return null;
    }

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