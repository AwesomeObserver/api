import * as format from 'date-fns/format';

import { TypeORMConnect } from 'core/db';
import { RoomUser as RoomUserEntity } from 'app/entity/RoomUser';

export class RoomFollowerClass {

  async getCount(roomId: number) {
    const TypeORM = await TypeORMConnect;
    let userRepository = TypeORM.getRepository(RoomUserEntity);
    return userRepository.count({ roomId, follower: true });
  }

  async follow(roomId: number, userId: number) {
    const TypeORM = await TypeORMConnect;
    let userRepository = TypeORM.getRepository(RoomUserEntity);
    let data = await userRepository.findOne({ userId, roomId });

    if (data) {
      if (data.follower) {
        return true;
      }

      return userRepository.updateById(data.id, {
        follower: true,
        lastFollowDate: format(+new Date())
      });
    } else {
      let roomUser = new RoomUserEntity();
      roomUser.roomId = roomId;
      roomUser.userId = userId;
      roomUser.follower = true;
      roomUser.firstFollowDate = format(+new Date());
      roomUser.lastFollowDate = format(+new Date());
      return userRepository.save(roomUser);
    }
  }

  async unfollow(roomId: number, userId: number) {
    const TypeORM = await TypeORMConnect;
    let userRepository = TypeORM.getRepository(RoomUserEntity);
    let data = await userRepository.findOne({ userId, roomId });

    if (!data.follower) {
      return true;
    }

    return userRepository.updateById(data.id, {
      follower: false,
      lastUnfollowDate: format(+new Date())
    });
  }
}

export const RoomFollower = new RoomFollowerClass();