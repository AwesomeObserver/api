import { Service, Action, BaseSchema } from 'moleculer-decorators';
import { getManager, getRepository, getConnection } from "typeorm";
import { format, addSeconds } from 'date-fns';
import { reorder, parsePlaySource } from 'core/utils';
import { broker, pubSub, logger } from 'core';
import { agenda } from 'core/db';
import {
  RoomWaitlistQueue as WaitlistQueueEntity
} from 'app/entity/RoomWaitlistQueue';

export const setupRoomWaitlistService = () => {
  const repository = getRepository(WaitlistQueueEntity);
  const manager = getManager();

  @Service({
    name: 'roomWaitlist'
  })
  class RoomWaitlistService extends BaseSchema {
    // Get current waitlist state
    //@ts-ignore
    @Action({
      cache: {
        keys: ["roomId"]
      },
      params: {
        roomId: "number"
      }
    })
    async getOne(ctx) {
      const { roomId } = ctx.params;
      return repository.findOne({ roomId: ctx.params.roomId });
    }

    @Action()
    async get(ctx) {
      const { roomId } = ctx.params;
      let queue: any = await broker.call('roomWaitlist.getOne', { roomId });

      if (queue.userId) {
        const user: any = await broker.call('user.getOne', {
          userId: queue.userId
        });
        queue.user = user;
      }

      if (queue.sourceId) {
        const source: any = await broker.call('source.getOne', {
          sourceId: queue.sourceId
        });
        queue.source = source;
      }

      return queue;
    }

    // Set User to Current Play
    @Action()
    async setPlay(ctx) {
      let { roomId, userId } = ctx.params;
      let source: any = null;
      let user: any = null;
      let sourceStart = 0;

      if (!userId) {

        userId = null;
        user = await broker.call('roomCollection.getBotData');
        const roomSource: any = await broker.call('roomCollection.getNext', { roomId });
        
        if (!roomSource) {
          const waitlistQueue: any = await broker.call('roomWaitlist.get', { roomId });
    
          if (waitlistQueue.users.length === 0) {
            return broker.call('roomWaitlist.clearPlay', { roomId });
          } else {
            const nextUserId = parseInt(waitlistQueue.users[0], 10);
            await broker.call('roomWaitlist.remove', { roomId, userId: nextUserId });
            return broker.call('roomWaitlist.setPlay', { roomId, userId: nextUserId });
          }
        }

        source = roomSource.source;

      } else {
        const [sourceData, userData]: any = await Promise.all([
          broker.call('roomUserPlaylist.cutFirst', { roomId, userId }),
          broker.call('user.getOne', { userId })
        ]);
    
        if (!sourceData) {
          const waitlistQueue: any = await broker.call('roomWaitlist.get', { roomId });
    
          if (waitlistQueue.users.length === 0) {
            return broker.call('roomWaitlist.clearPlay', { roomId });
          } else {
            const nextUserId = parseInt(waitlistQueue.users[0], 10);
            await broker.call('roomWaitlist.remove', { roomId, userId: nextUserId });
            return broker.call('roomWaitlist.setPlay', { roomId, userId: nextUserId });
          }
        }

        user = userData;
        sourceStart = sourceData.start;
        source = await broker.call('source.getOne', {
          sourceId: sourceData.sourceId
        });
      }

      const duration = source.duration - sourceStart;
      const start = +new Date() - sourceStart * 1000;
      const end = +new Date() + duration * 1000;

      agenda.create('waitlistPlayEnd', { roomId });
      agenda.schedule(addSeconds(new Date(), duration), 'waitlistPlayEnd', { roomId });

      // Save Current Play Data
      await repository.update({ roomId }, {
        userId,
        sourceId: source.id,
        sourceStart,
        start: format(start),
        end: format(end)
      });

      await broker.cacher.del(`roomWaitlist.getOne:${roomId}`);

      broker.call('room.setContentTitle', { roomId, contentTitle: source.title });
      
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
    @Action()
    async clearPlay(ctx) {
      const { roomId } = ctx.params;

      await repository.update({ roomId }, {
        sourceId: null,
        userId: null,
        start: null,
        end: null
      });

      await broker.cacher.del(`roomWaitlist.getOne:${roomId}`);

      broker.call('room.setContentTitle', { roomId, contentTitle: '' });
      pubSub.publish('waitlistPlayData', null, { roomId });
    }

    @Action()
    async cancelPlay(ctx) {
      const { roomId } = ctx.params;

      return new Promise(resolve => {
        agenda.cancel({ name: 'waitlistPlayEnd', data: { roomId } }, resolve);
      });
    }

    @Action()
    async kick(ctx) {
      const { roomId, userId } = ctx.params;
      const waitlistQueue: any = await broker.call('roomWaitlist.get', { roomId });

      if (userId && (userId != waitlistQueue.userId)) {
        logger.info(`User ${userId} not playing now`);
        return false;
      }

      await broker.call('roomWaitlist.cancelPlay', { roomId });

      if (waitlistQueue.users.length === 0) {
        return broker.call('roomWaitlist.clearPlay', { roomId });
      }

      const nextUserId = parseInt(waitlistQueue.users[0], 10);
      await broker.call('roomWaitlist.remove', { roomId, userId: nextUserId });
      return broker.call('roomWaitlist.setPlay', { roomId, userId: nextUserId });
    }

    @Action()
    async skip(ctx) {
      const { roomId } = ctx.params;
      await broker.call('roomWaitlist.cancelPlay', { roomId });
      return broker.call('roomWaitlist.endPlay', { roomId });
    }

    @Action()
    async endPlay(ctx) {
      const { roomId } = ctx.params;
      const waitlistQueue: any = await broker.call('roomWaitlist.get', { roomId });

      if (waitlistQueue.users.length === 0) {
        await broker.call('roomWaitlist.setPlay', { roomId, userId: waitlistQueue.userId });
      } else {
        const nextUserId = parseInt(waitlistQueue.users[0], 10);
        await broker.call('roomWaitlist.remove', { roomId, userId: nextUserId });
        await broker.call('roomWaitlist.setPlay', { roomId, userId: nextUserId });
        await broker.call('roomWaitlist.add', { roomId, userId: waitlistQueue.userId });
      }
    }

    // Create Queue for Room
    @Action()
    async create(ctx) {
      const { roomId } = ctx.params;
      let waitlistQueue = new WaitlistQueueEntity();

      waitlistQueue.roomId = roomId;
      waitlistQueue.users = [];
    
      return manager.save(waitlistQueue);
    }

    // Add User to Queue
    @Action()
    async add(ctx) {
      let { roomId, userId } = ctx.params;
      let user = null;

      if (!userId) {
        userId = 0;
        user = await broker.call('roomCollection.getBotData');
      } else {
        const userQueue: any = await broker.call('roomUserPlaylist.getWithCreate', {
          roomId,
          userId
        });

        if (!userQueue) {
          return false;
        }

        if (userQueue.sources.length == 0) {
          logger.info(`User ${userId} dont have sources`);
          return false;
        }

        user = await broker.call('user.getOne', { userId });
      }

      const waitlistQueue: any = await broker.call('roomWaitlist.get', { roomId });
      
      if (
        waitlistQueue.userId === userId ||
        (waitlistQueue.userId === null && !!waitlistQueue.start && userId === 0)
      ) {
        logger.info(`User ${userId} palying now`);
        return false;
      }

      // If nobody playing now
      if (!waitlistQueue.start && waitlistQueue.users.length === 0) {
        return broker.call('roomWaitlist.setPlay', { roomId, userId });
      }

      if (waitlistQueue.users.findIndex(uId => parseInt(uId, 10) == userId) >= 0) {
        logger.info(`User ${userId} wait now`);
        return false;
      }

      const res = await repository.updateById(waitlistQueue.id, {
        users: [...waitlistQueue.users, userId]
      });

      await broker.cacher.del(`roomWaitlist.getOne:${roomId}`);

      pubSub.publish('waitlistAddUser', user, { roomId });
      
      return res;
    }

    // Remove User from Queue
    @Action()
    async remove(ctx) {
      const { roomId, userId } = ctx.params;
      const waitlistQueue: any = await broker.call('roomWaitlist.get', { roomId });
      const users = waitlistQueue.users.filter(uId => parseInt(uId, 10) != userId);
      const res = await repository.updateById(waitlistQueue.id, { users });
      await broker.cacher.del(`roomWaitlist.getOne:${roomId}`);
      pubSub.publish('waitlistRemoveUser', userId, { roomId });
      return res;
    }

    @Action()
    async clear(ctx) {
      const { roomId } = ctx.params;
      const res = await repository.update({ roomId }, { users: [] });
      await broker.cacher.del(`roomWaitlist.getOne:${roomId}`);
      pubSub.publish('waitlistClear', null, { roomId });
      return res;
    }
    
    // Change User position in Queue
    @Action()
    async move(ctx) {
      const { roomId, lastPos, newPos } = ctx.params;
      const waitlistQueue: any = await broker.call('roomWaitlist.get', { roomId });

      if (!waitlistQueue) {
        return false;
      }

      let users = waitlistQueue.users;

      if (users.length < newPos + 1) {
        return false;
      }

      users = reorder(waitlistQueue.users, lastPos, newPos);
      const res = await repository.updateById(waitlistQueue.id, { users });
      await broker.cacher.del(`roomWaitlist.getOne:${roomId}`);
      pubSub.publish('waitlistMoveUser', { lastPos, newPos }, { roomId });
      return res;
    }
  }

  return broker.createService(RoomWaitlistService);
}