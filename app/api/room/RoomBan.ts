import { format } from 'date-fns';
import { getConnection } from "typeorm";
import { pubSub } from 'core/pubsub';
import { roomUserAPI } from 'app/api';

export class RoomBanAPI {

  async getCount(roomId: number) {
    return roomUserAPI.count({ roomId, banned: true });
  }

  async getUsers(roomId: number) {
    const data = await roomUserAPI.repository
      .createQueryBuilder("roomUser")
      .where("roomUser.roomId = :roomId", { roomId })
      .andWhere("roomUser.banned = :banned", { banned: true })
      .leftJoinAndSelect("roomUser.user", "user")
      .getMany();

    return data;
  }

  async ban(roomId: number, userId: number) {
    const data = await roomUserAPI.getPure(userId, roomId);

    if (data) {
      if (data.banned) return true;

      const res = await roomUserAPI.update(data.id, {
        banned: true,
        banDate: format(+new Date())
      });

      // PubSub.publish('userBannedInRoom', {
      //   userBannedInRoom: userId,
      //   roomId
      // });

      return res;
    }

    const res = await roomUserAPI.create({
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
    const data = await roomUserAPI.getPure(userId, roomId);

    if (!data.banned) return true;

    return roomUserAPI.update(data.id, {
      banned: false
    });
  }

}