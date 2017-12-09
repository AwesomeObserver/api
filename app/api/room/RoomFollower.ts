import * as format from 'date-fns/format';

import { RoomUser } from 'app/api/room/RoomUser';

export class RoomFollowerClass {

  async getCount(roomId: number) {
    return RoomUser.count({ roomId, follower: true });
  }

  async follow(roomId: number, userId: number) {
    const data = await RoomUser.getPure(userId, roomId);

    if (data) {
      if (data.follower) return true;

      return RoomUser.update(data.id, {
        follower: true,
        lastFollowDate: format(+new Date())
      });
    }

    return RoomUser.create({
      roomId: roomId,
      userId: userId,
      follower: true,
      firstFollowDate: format(+new Date()),
      lastFollowDate: format(+new Date())
    });
  }

  async unfollow(roomId: number, userId: number) {
    const data = await RoomUser.getPure(userId, roomId);

    if (!data.follower) return true;

    return RoomUser.update(data.id, {
      follower: false,
      lastUnfollowDate: format(+new Date())
    });
  }
}

export const RoomFollower = new RoomFollowerClass();