import * as format from 'date-fns/format';
import * as addSeconds from 'date-fns/add_seconds';
import { getConnection } from "typeorm";
import { Agenda } from 'core/db';
import { PubSub } from 'core/pubsub';
import {
  RoomWaitlistQueue as WaitlistQueueEntity
} from 'app/entity/RoomWaitlistQueue';
import { User } from 'app/api/user/User';
import { RoomUserWaitlistQueue } from './RoomUserWaitlistQueue';

const getSourceById = async (sourceId) => {
  const sources = {
    1: {
      title: 'The Upbeats - Punks',
      cover: null,
      service: 'youtube',
      duration: 20, //4 * 60 + 3,
      serviceId: 'ObEBLsYEgeg'
    },
    2: {
      title: 'Sustance - Impulsive',
      cover: null,
      service: 'youtube',
      duration: 20,//4 * 60 + 54,
      serviceId: 'ZLJ_nEOGwQI'
    }
  }

  return sources[sourceId];
}

class RoomWaitlistQueueClass {

  get repository() {
    return getConnection().getRepository(WaitlistQueueEntity);
  }

  get manager() {
    return getConnection().manager;
  }

  // Get current waitlist state
  async get(roomId: number) {
    return this.repository.findOne({
      where: { roomId },
      relations: ["user"]
    });
  }

  // Set User to Current Play
  async setPlay(roomId: number, userId: number) {
    const [sourceId, user] = await Promise.all([
      RoomUserWaitlistQueue.cutFirst(roomId, userId),
      User.getById(userId)
    ]);

    if (!sourceId) {
      const waitlistQueue = await this.get(roomId);

      if (waitlistQueue.users.length === 0) {
        return this.clearPlay(roomId);
      } else {
        const nextUserId = parseInt(waitlistQueue.users[0], 10);
        await this.remove(roomId, nextUserId);
        return this.setPlay(roomId, nextUserId);
      }
    }

    const source = await getSourceById(sourceId);

    const duration = source.duration;
    const start = +new Date();
    const end = +new Date() + duration * 1000;

    Agenda.create('waitlistPlayEnd', { roomId });
    Agenda.schedule(addSeconds(new Date(), duration), 'waitlistPlayEnd', { roomId });

    // Save Current Play Data
    await this.repository.update({ roomId }, {
      userId: user.id,
      start: format(start),
      end: format(end)
    });
    
    // Publish New Play Data in Room
    PubSub.publish('waitlistPlayData', {
      start,
      serverTime: +new Date(),
      source,
      user
    }, { roomId });
  }

  // Clear Current Play
  async clearPlay(roomId: number) {
    await this.repository.update({ roomId }, {
      userId: null,
      start: null,
      end: null
    });

    PubSub.publish('waitlistPlayData', null, { roomId });
  }

  async cancelPlay(roomId: number) {
    return new Promise(resolve => {
      Agenda.cancel({ name: 'waitlistPlayEnd', data: { roomId } }, resolve);
    });
  }

  async kick(roomId: number, userId: number) {
    const waitlistQueue = await this.get(roomId);

    if (userId != waitlistQueue.userId) {
      console.log(`User ${userId} not playing now`);
      return false;
    }

    await this.cancelPlay(roomId);

    if (waitlistQueue.users.length === 0) {
      return this.clearPlay(roomId);
    }

    const nextUserId = parseInt(waitlistQueue.users[0], 10);
    await this.remove(roomId, nextUserId);
    return this.setPlay(roomId, nextUserId);
  }

  async endPlay(roomId: number) {
    const waitlistQueue = await this.get(roomId);

    if (waitlistQueue.users.length === 0) {
      this.setPlay(roomId, waitlistQueue.userId);
    } else {
      const nextUserId = parseInt(waitlistQueue.users[0], 10);
      await this.remove(roomId, nextUserId);
      await this.setPlay(roomId, nextUserId);
      await this.add(roomId, waitlistQueue.userId);
    }
  }

  // Create Queue for Room
  async create(roomId: number) {
    let waitlistQueue = new WaitlistQueueEntity();

    waitlistQueue.roomId = roomId;
    waitlistQueue.users = [];
  
    return this.manager.save(waitlistQueue);
  }

  // Add User to Queue
  async add(roomId: number, userId: number) {
    const userQueue = await RoomUserWaitlistQueue.getWithCreate(roomId, userId);

    if (userQueue.sources.length == 0) {
      console.log(`User ${userId} dont have sources`);
      return false;
    }

    const waitlistQueue = await this.get(roomId);
    
    if (waitlistQueue.userId === userId) {
      console.log(`User ${userId} palying now`);
      return false;
    }

    // If nobody playing now
    if (!waitlistQueue.userId && waitlistQueue.users.length === 0) {
      return this.setPlay(roomId, userId);
    }

    if (waitlistQueue.users.findIndex(uId => parseInt(uId, 10) == userId) >= 0) {
      console.log(`User ${userId} wait now`);
      return false;
    }

    return this.repository.updateById(waitlistQueue.id, {
      users: [...waitlistQueue.users, userId]
    });
  }

  // Remove User from Queue
  async remove(roomId: number, userId: number) {
    const waitlistQueue = await this.get(roomId);

    const users = waitlistQueue.users.filter(uId => parseInt(uId, 10) != userId);

    return this.repository.updateById(waitlistQueue.id, { users });
  }

  async clear(roomId: number) {
    return this.repository.update({ roomId }, { users: [] });
  }
  
  // Change User position in Queue
  async move(roomId: number, lastPos: number, newPos: number) {
    const waitlistQueue = await this.get(roomId);

    let users = waitlistQueue.users;

    if (users.length < newPos + 1) {
      return false;
    }

    const lastUser = users[lastPos];
    users[lastPos] = users[newPos];
    users[newPos] = lastUser;

    return this.repository.updateById(waitlistQueue.id, { users });
  }

}

export const RoomWaitlistQueue = new RoomWaitlistQueueClass();