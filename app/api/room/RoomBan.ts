import * as format from 'date-fns/format';

import { getConnection } from "typeorm";
import { PubSub } from 'core/pubsub';
import { RoomUser } from 'app/api/room/RoomUser';

export class RoomBanClass {

  async getCount(roomId: number) {
    return RoomUser.count({ roomId, banned: true });
  }

  async getUsers(roomId: number) {
    const data = await RoomUser.repository
      .createQueryBuilder("roomUser")
      .where("roomUser.roomId = :roomId", { roomId })
      .andWhere("roomUser.banned = :banned", { banned: true })
      .leftJoinAndSelect("roomUser.user", "user")
      .getMany();

    return data;
  }

  async ban(roomId: number, userId: number) {
    const data = await RoomUser.getPure(userId, roomId);

    if (data) {
      if (data.banned) return true;

      const res = await RoomUser.update(data.id, {
        banned: true,
        banDate: format(+new Date())
      });

      // PubSub.publish('userBannedInRoom', {
      //   userBannedInRoom: userId,
      //   roomId
      // });

      return res;
    }

    const res = await RoomUser.create({
      roomId,
      userId,
      banned: true,
      banDate: format(+new Date()),
    });

    // PubSub.publish('userBannedInRoom', {
    //   userBannedInRoom: userId,
    //   roomId
    // });

    return res;
  }

  async unban(roomId: number, userId: number) {
    const data = await RoomUser.getPure(userId, roomId);

    if (!data.banned) return true;

    return RoomUser.update(data.id, {
      banned: false
    });
  }

}

export const RoomBan = new RoomBanClass();