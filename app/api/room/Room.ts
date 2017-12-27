import { format } from 'date-fns';
import { getConnection } from "typeorm";
import { Room as RoomEntity } from 'app/entity/Room';
import { pubSub } from 'core/pubsub';
import {
  roomConnectionAPI,
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
      roomConnectionAPI.getCount(room.id),
      roomFollowerAPI.getCount(room.id)
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

  async create(name: string, title: string, userId: number) {
    let room = new RoomEntity();

    name = name.trim();
    title = title.trim();

    if (!name.match(/^[a-zA-Z0-9_]+$/)) {
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