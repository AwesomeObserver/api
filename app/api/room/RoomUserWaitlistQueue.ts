import { getConnection } from "typeorm";
import {
  RoomUserWaitlistQueue as UserWaitlistQueue
} from 'app/entity/RoomUserWaitlistQueue';

class RoomUserWaitlistQueueClass {

  async getUserQueue(roomId: number, userId: number) {

  }

  async addTrack(roomId: number, userId: number, sourceId: number) {

  }

  async removeTrack(roomId: number, userId: number, sourceId: number) {

  }

  async moveTrack(
    roomId: number,
    userId: number,
    lastPos: number,
    newPos: number
  ) {

  }

}

export const RoomUserWaitlistQueue = new RoomUserWaitlistQueueClass();