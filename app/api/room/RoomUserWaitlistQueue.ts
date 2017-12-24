import { getConnection } from "typeorm";
import {
  RoomUserWaitlistQueue as UserWaitlistQueueEntity
} from 'app/entity/RoomUserWaitlistQueue';
import { Source } from 'app/api/music/Source';

class RoomUserWaitlistQueueClass {

  get repository() {
    return getConnection().getRepository(UserWaitlistQueueEntity);
  }

  get manager() {
    return getConnection().manager;
  }

  async cutFirst(roomId: number, userId: number) {
    const userQueue = await this.getWithCreate(roomId, userId);

    if (userQueue.sources.length == 0) {
      return false;
    }

    const firstSourceId = parseInt(userQueue.sources[0], 10);

    const sources = userQueue.sources.filter(sId => {
      return parseInt(sId, 10) != firstSourceId;
    });

    await this.repository.updateById(userQueue.id, { sources });

    return firstSourceId;
  }

  async getWithCreate(roomId: number, userId: number) {
    let userQueue = await this.get(roomId, userId);

    if (!userQueue) {
      userQueue = await this.create(roomId, userId);
    }

    return userQueue;
  }

  async get(roomId: number, userId: number) {
    return this.repository.findOne({
      where: { roomId, userId }
    });
  }

  async create(roomId: number, userId: number) {
    let userQueue = new UserWaitlistQueueEntity();

    userQueue.roomId = roomId;
    userQueue.userId = userId;
    userQueue.sources = [];
  
    return this.manager.save(userQueue);
  }

  async addFromLink(roomId: number, userId: number, link: string) {
    const sourceId = await Source.addFromLink(link);

    if (!sourceId) {
      return false;
    }

    this.add(roomId, userId, sourceId);
  }

  async add(roomId: number, userId: number, sourceId: number) {
    const userQueue = await this.getWithCreate(roomId, userId);

    if (userQueue.sources.findIndex(sId => parseInt(sId, 10) == sourceId) >= 0) {
      console.log(`User ${userId} have source ${sourceId} now`);
      return false;
    }

    return this.repository.updateById(userQueue.id, {
      sources: [...userQueue.sources, sourceId]
    });
  }

  async remove(roomId: number, userId: number, sourceId: number) {
    const userQueue = await this.getWithCreate(roomId, userId);

    if (userQueue.sources.length == 0) {
      return false;
    }

    return this.repository.updateById(userQueue.id, {
      sources: userQueue.sources.filter(sId => parseInt(sId, 10) != sourceId)
    });
  }

  async move(
    roomId: number,
    userId: number,
    lastPos: number,
    newPos: number
  ) {
    const userQueue = await this.getWithCreate(roomId, userId);

    let sources = userQueue.sources;

    if (sources.length < newPos + 1) {
      return false;
    }

    const lastUser = sources[lastPos];
    sources[lastPos] = sources[newPos];
    sources[newPos] = lastUser;

    return this.repository.updateById(userQueue.id, { sources });
  }

}

export const RoomUserWaitlistQueue = new RoomUserWaitlistQueueClass();