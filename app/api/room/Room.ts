import * as format from 'date-fns/format';

import { getConnection } from "typeorm";
import { PubSub } from 'core/pubsub';
import { RoomConnection } from './RoomConnection';
import { RoomFollower } from './RoomFollower';
import { RoomRole } from './RoomRole';
import { RoomWaitlistQueue } from './RoomWaitlistQueue';
import { Room as RoomEntity } from 'app/entity/Room';

export class RoomClass {

  get repository() {
    return getConnection().getRepository(RoomEntity);
  }

  get manager() {
    return getConnection().manager;
  }

  async withData(room) {
    const [counts, followersCount] = await Promise.all([
      RoomConnection.getCount(room.id),
      RoomFollower.getCount(room.id)
    ]);

    const defaultAvatar = 'https://pp.userapi.com/c626221/v626221510/7026b/zKYk5tlr530.jpg';

    return {
      ...room,
      ...counts,
      avatar: room.avatar ? room.avatar : defaultAvatar,
      followersCount
    };
  }

  async getOne(where) {
    const room = await this.getOnePure(where);

    if (!room) {
      return null;
    }
    
    return this.withData(room);
  }

  async getOnePure(where) {
    return this.repository.findOne({ where, cache: true });
  }

  async get() {
    const rooms = await this.repository.find();

    return rooms.map(room => this.withData(room));
  }

  async getByName(name: string) {
    return this.getOne({ name });
  }

  async create(data, userId) {
    let room = new RoomEntity();

    for (const name of Object.keys(data) ) {
      room[name] = data[name];
    }

    const roomData = await this.manager.save(room);

    await Promise.all([
      RoomRole.set({
        roomId: roomData.id,
        userId,
        role: 'owner',
        whoSetRoleId: null
      }),
      RoomWaitlistQueue.create(roomData.id)
    ]);

    return roomData;
  }

  async remove(roomId) {
    return this.repository.removeById(roomId);
  }

  async ban(roomId, data) {
    
    await this.repository.updateById(roomId, {
      banned: true,
      banDate: format(+new Date()),
      whoSetBanId: data.whoSetBanId,
      banReason: data.banReason
    });

    return true;
  }

  async unbanByName(roomName) {
    
    await this.repository.update({ name: roomName }, {
      banned: false,
      banDate: null,
      whoSetBanId: null,
      banReason: null
    });

    return true;
  }

  async setSlowMode(roomId: number, isActive: boolean) {
    
    await this.repository.updateById(roomId, {
      slowMode: isActive
    });

    // const payload = {
    //   slowModeChanged: isActive,
    //   roomId
    // };
    
    // PubSub.publish('slowModeChanged', payload);

    return true;
  }

  async setFollowerMode(roomId: number, isActive: boolean) {
    
    await this.repository.updateById(roomId, {
      followerMode: isActive
    });

    const payload = {
      followerModeChanged: isActive,
      roomId
    };
    
    // PubSub.publish('followerModeChanged', payload);

    return true;
  }
}

export const Room = new RoomClass();