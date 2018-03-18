import { format, addSeconds } from 'date-fns';
import { getConnection } from "typeorm";
import { agenda } from 'core/db';
import { pubSub } from 'core/pubsub';
import { reorder } from 'core/utils';
import { logger } from 'core/logger';
import {
  RoomWaitlistQueue as WaitlistQueueEntity
} from 'app/entity/RoomWaitlistQueue';
import { userAPI, sourceAPI, roomModeWaitlistUserAPI } from 'app/api';

export class RoomModeWaitlistAPI {

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
      relations: ["user", "source"]
    });
  }

  // Set User to Current Play
  async setPlay(roomId: number, userId: number) {
    const [sourceData, user] = await Promise.all([
      roomModeWaitlistUserAPI.cutFirst(roomId, userId),
      userAPI.getById(userId)
    ]);

    if (!sourceData) {
      const waitlistQueue = await this.get(roomId);

      if (waitlistQueue.users.length === 0) {
        return this.clearPlay(roomId);
      } else {
        const nextUserId = parseInt(waitlistQueue.users[0], 10);
        await this.remove(roomId, nextUserId);
        return this.setPlay(roomId, nextUserId);
      }
    }

    const source = await sourceAPI.getById(sourceData.sourceId);

    const duration = source.duration - sourceData.start;
    const start = +new Date() - sourceData.start * 1000;
    const end = +new Date() + duration * 1000;

    agenda.create('waitlistPlayEnd', { roomId });
    agenda.schedule(addSeconds(new Date(), duration), 'waitlistPlayEnd', { roomId });

    // Save Current Play Data
    await this.repository.update({ roomId }, {
      userId: user.id,
      sourceId: source.id,
      sourceStart: sourceData.start,
      start: format(start),
      end: format(end)
    });
    
    // Publish New Play Data in Room
    pubSub.publish('waitlistPlayData', {
      start,
      serverTime: +new Date(),
      sourceStart: sourceData.start,
      source,
      user
    }, { roomId });
  }

  // Clear Current Play
  async clearPlay(roomId: number) {
    await this.repository.update({ roomId }, {
      sourceId: null,
      userId: null,
      start: null,
      end: null
    });

    pubSub.publish('waitlistPlayData', null, { roomId });
  }

  async cancelPlay(roomId: number) {
    return new Promise(resolve => {
      agenda.cancel({ name: 'waitlistPlayEnd', data: { roomId } }, resolve);
    });
  }

  async kick(roomId: number, userId?: number) {
    const waitlistQueue = await this.get(roomId);

    if (userId && (userId != waitlistQueue.userId)) {
      logger.info(`User ${userId} not playing now`);
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


  async skip(roomId: number) {
    await this.cancelPlay(roomId);
    return this.endPlay(roomId);
  }

  endPlay = async (roomId: number) => {
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
    const userQueue = await roomModeWaitlistUserAPI.getWithCreate(roomId, userId);

    if (!userQueue) {
      return false;
    }

    if (userQueue.sources.length == 0) {
      logger.info(`User ${userId} dont have sources`);
      return false;
    }

    const waitlistQueue = await this.get(roomId);
    
    if (waitlistQueue.userId === userId) {
      logger.info(`User ${userId} palying now`);
      return false;
    }

    // If nobody playing now
    if (!waitlistQueue.userId && waitlistQueue.users.length === 0) {
      return this.setPlay(roomId, userId);
    }

    if (waitlistQueue.users.findIndex(uId => parseInt(uId, 10) == userId) >= 0) {
      logger.info(`User ${userId} wait now`);
      return false;
    }

    const res = await this.repository.updateById(waitlistQueue.id, {
      users: [...waitlistQueue.users, userId]
    });

    const user = await userAPI.getById(userId);

    pubSub.publish('waitlistAddUser', user, { roomId });
    
    return res;
  }

  // Remove User from Queue
  async remove(roomId: number, userId: number) {
    const waitlistQueue = await this.get(roomId);

    const users = waitlistQueue.users.filter(uId => parseInt(uId, 10) != userId);

    const res = await this.repository.updateById(waitlistQueue.id, { users });

    pubSub.publish('waitlistRemoveUser', userId, { roomId });

    return res;
  }

  async clear(roomId: number) {
    return this.repository.update({ roomId }, { users: [] });
  }
  
  // Change User position in Queue
  async move(roomId: number, lastPos: number, newPos: number) {
    const waitlistQueue = await this.get(roomId);

    if (!waitlistQueue) {
      return false;
    }

    let users = waitlistQueue.users;

    if (users.length < newPos + 1) {
      return false;
    }

    users = reorder(waitlistQueue.users, lastPos, newPos);

    const res = await this.repository.updateById(waitlistQueue.id, { users });
    
    pubSub.publish('waitlistMoveUser', { lastPos, newPos }, { roomId });

    return res;
  }

}