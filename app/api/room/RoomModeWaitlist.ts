import { format, addSeconds } from 'date-fns';
import { getConnection } from "typeorm";
import { agenda } from 'core/db';
import { broker } from 'core/broker';
import { pubSub } from 'core/pubsub';
import { reorder } from 'core/utils';
import { logger } from 'core/logger';
import {
  RoomWaitlistQueue as WaitlistQueueEntity
} from 'app/entity/RoomWaitlistQueue';
import {
  roomAPI,
  sourceAPI,
  roomCollectionAPI,
  roomModeWaitlistUserAPI
} from 'app/api';

export class RoomModeWaitlistAPI {

  get repository() {
    return getConnection().getRepository(WaitlistQueueEntity);
  }

  get manager() {
    return getConnection().manager;
  }

  // Get current waitlist state
  async get(roomId: number) {
    let queue = await this.repository.findOne({ roomId });

    if (queue.userId) {
      const user: any = await broker.call('user.getOne', { userId: queue.userId });
      queue.user = user;
    }

    if (queue.sourceId) {
      const source: any = await sourceAPI.getById(queue.sourceId);
      queue.source = source;
    }

    return queue;
  }

  // Set User to Current Play
  async setPlay(roomId: number, userId?: number) {
    let source = null;
    let user = null;
    let sourceStart = 0;

    if (!userId) {

      userId = null;
      user = roomCollectionAPI.getBotData();
      const roomSource = await roomCollectionAPI.getNext(roomId);

      if (!roomSource) {
        const waitlistQueue = await this.get(roomId);
  
        if (waitlistQueue.users.length === 0) {
          return this.clearPlay(roomId);
        } else {
          const nextUserId = parseInt(waitlistQueue.users[0], 10);
          await this.remove(roomId, nextUserId);
          return this.setPlay(roomId, nextUserId);
        }
      }

      source = roomSource.source;

    } else {
      const [sourceData, userData] = await Promise.all([
        roomModeWaitlistUserAPI.cutFirst(roomId, userId),
        broker.call('user.getOne', { userId })
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

      user = userData;
      sourceStart = sourceData.start;
      source = await sourceAPI.getById(sourceData.sourceId);
    }

    const duration = source.duration - sourceStart;
    const start = +new Date() - sourceStart * 1000;
    const end = +new Date() + duration * 1000;

    agenda.create('waitlistPlayEnd', { roomId });
    agenda.schedule(addSeconds(new Date(), duration), 'waitlistPlayEnd', { roomId });

    // Save Current Play Data
    await this.repository.update({ roomId }, {
      userId,
      sourceId: source.id,
      sourceStart,
      start: format(start),
      end: format(end)
    });

    roomAPI.setContentTitle(roomId, source.title);
    
    // Publish New Play Data in Room
    pubSub.publish('waitlistPlayData', {
      start,
      serverTime: +new Date(),
      sourceStart,
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

    roomAPI.setContentTitle(roomId, '');

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
    let user = null;

    if (!userId) {
      userId = 0;
      user = roomCollectionAPI.getBotData();
    } else {
      const userQueue = await roomModeWaitlistUserAPI.getWithCreate(roomId, userId);

      if (!userQueue) {
        return false;
      }

      if (userQueue.sources.length == 0) {
        logger.info(`User ${userId} dont have sources`);
        return false;
      }

      user = await broker.call('user.getOne', { userId });
    }

    const waitlistQueue = await this.get(roomId);
    
    if (
      waitlistQueue.userId === userId ||
      (waitlistQueue.userId === null && !!waitlistQueue.start && userId === 0)
    ) {
      logger.info(`User ${userId} palying now`);
      return false;
    }

    // If nobody playing now
    if (!waitlistQueue.start && waitlistQueue.users.length === 0) {
      return this.setPlay(roomId, userId);
    }

    if (waitlistQueue.users.findIndex(uId => parseInt(uId, 10) == userId) >= 0) {
      logger.info(`User ${userId} wait now`);
      return false;
    }

    const res = await this.repository.updateById(waitlistQueue.id, {
      users: [...waitlistQueue.users, userId]
    });

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
    const res = await this.repository.update({ roomId }, { users: [] });

    pubSub.publish('waitlistClear', null, { roomId });

    return res;
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