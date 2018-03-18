import { getConnection } from "typeorm";
import {
  RoomUserWaitlistQueue as UserWaitlistQueueEntity
} from 'app/entity/RoomUserWaitlistQueue';
import { logger } from 'core/logger';
import { pubSub } from 'core/pubsub';
import { reorder } from 'core/utils';
import { sourceAPI } from 'app/api';

export class RoomModeWaitlistUserAPI {

  get repository() {
    return getConnection().getRepository(UserWaitlistQueueEntity);
  }

  get manager() {
    return getConnection().manager;
  }

  parse = (sourceData: string) => {
    const sourceRegexRes = sourceData.match(/([0-9]+):([0-9]+)/);
    const sourceId = parseInt(sourceRegexRes[1], 10);
    const start = parseInt(sourceRegexRes[2], 10);
    return { sourceId, start };
  }

  async cutFirst(
    roomId: number,
    userId: number
  ) {
    const userQueue = await this.getWithCreate(roomId, userId);

    if (!userQueue || userQueue.sources.length == 0) {
      return false;
    }

    const firstSource = this.parse(userQueue.sources[0]);
    
    const sources = this.removeFromArray(userQueue.sources, firstSource.sourceId)

    await this.repository.updateById(userQueue.id, { sources });

    pubSub.publish('waitlistRemoveSource', firstSource.sourceId, { userId, roomId });

    return firstSource;
  }

  async getWithCreate(
    roomId: number,
    userId: number
  ) {
    if (!userId) return false;

    let userQueue = await this.get(roomId, userId);

    if (!userQueue) {
      userQueue = await this.create(roomId, userId);
    }

    return userQueue;
  }

  async get(
    roomId: number,
    userId: number
  ) {
    return this.repository.findOne({
      where: { roomId, userId }
    });
  }

  async create(
    roomId: number,
    userId: number
  ) {
    let userQueue = new UserWaitlistQueueEntity();

    userQueue.roomId = roomId;
    userQueue.userId = userId;
    userQueue.sources = [];
  
    return this.manager.save(userQueue);
  }

  async addFromLink(
    roomId: number,
    userId: number,
    link: string,
    useTimecode: boolean
  ) {
    const { source, start } = await sourceAPI.addFromLink(link, useTimecode);

    if (!source) {
      return false;
    }

    this.add(roomId, userId, source.id, start, source);
  }

  async add(
    roomId: number,
    userId: number,
    sourceId: number,
    start: number,
    source?
  ) {
    const userQueue = await this.getWithCreate(roomId, userId);

    if (!userQueue) {
      return null;
    }

    if ((userQueue.sources.length + 1) > 50) {
      logger.info(`User ${userId} get waitlist sources limit`);
      return false;
    }

    const isExist = userQueue.sources.findIndex(sData => {
      return this.parse(sData).sourceId == sourceId;
    }) >= 0;

    if (isExist) {
      logger.info(`User ${userId} have source ${sourceId} now`);
      return false;
    }

    const res = await this.repository.updateById(userQueue.id, {
      sources: [...userQueue.sources, `${sourceId}:${start}`]
    });

    if (source) {
      pubSub.publish('waitlistAddSource', { source, start }, { userId, roomId });
    }

    return res;
  }

  removeFromArray = (array, id) => {
    return array.filter(sData => this.parse(sData).sourceId != id);
  }

  async remove(
    roomId: number,
    userId: number,
    sourceId: number
  ) {
    const userQueue = await this.getWithCreate(roomId, userId);

    if (!userQueue) {
      return false;
    }

    if (userQueue.sources.length == 0) {
      return false;
    }

    const res = await this.repository.updateById(userQueue.id, {
      sources: this.removeFromArray(userQueue.sources, sourceId)
    });

    pubSub.publish('waitlistRemoveSource', sourceId, { userId, roomId });

    return res;
  }

  async move(
    roomId: number,
    userId: number,
    lastPos: number,
    newPos: number
  ) {
    const userQueue = await this.getWithCreate(roomId, userId);

    if (!userQueue) {
      return false;
    }

    let sources = userQueue.sources;

    if (sources.length < newPos + 1) {
      return false;
    }

    sources = reorder(userQueue.sources, lastPos, newPos);

    const res = await this.repository.updateById(userQueue.id, { sources });

    pubSub.publish('waitlistMoveSource', { lastPos, newPos }, { userId, roomId });

    return res;
  }

}