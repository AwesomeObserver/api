import * as format from 'date-fns/format';
import { getConnection } from "typeorm";
import {
  RoomWaitlistQueue as WaitlistQueueEntity
} from 'app/entity/RoomWaitlistQueue';

class RoomWaitlistQueueClass {

  get repository() {
    return getConnection().getRepository(WaitlistQueueEntity);
  }

  get manager() {
    return getConnection().manager;
  }

  async get(roomId: number) {
    return this.repository.findOne({
      where: { roomId },
      relations: ["user"]
    });
  }

  async set(roomId: number, userId: number) {
    return this.repository.update({ roomId }, {
      userId,
      start: format(+new Date()),
      end: format(+new Date() + (4 * 60 + 3) * 1000)
    });
  }

  async create(roomId: number) {
    let waitlistQueue = new WaitlistQueueEntity();

    waitlistQueue.roomId = roomId;
    waitlistQueue.users = [];
  
    return this.manager.save(waitlistQueue);
  }

  async add(roomId: number, userId: number) {
    const waitlistQueue = await this.get(roomId);

    if (waitlistQueue.users.findIndex(uId => uId == userId) >= 0) {
      return false;
    }

    return this.repository.updateById(waitlistQueue.id, {
      users: [...waitlistQueue.users, userId]
    });
  }

  async remove(roomId: number, userId: number) {
    const waitlistQueue = await this.get(roomId);

    const users = waitlistQueue.users.filter(uId => uId != userId);

    return this.repository.updateById(waitlistQueue.id, { users });
  }

  async clear(roomId: number) {
    return this.repository.update({ roomId }, { users: [] });
  }
  
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