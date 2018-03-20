import { format } from 'date-fns';
import { roomUserAPI } from 'app/api';

export class RoomFollowerAPI {

  async getCount(roomId: number) {
    return roomUserAPI.count({ roomId, follower: true });
  }

  getRooms = async (userId: number) => {
    const userRooms = await roomUserAPI.repository.find({
      where: { userId, follower: true },
      relations: ['room'],
      select: ['room']
    });

    const rooms = userRooms.map(({ room }) => room);
    return rooms;
  }

  async follow(roomId: number, userId: number) {
    const data = await roomUserAPI.getPure(userId, roomId);

    if (data) {
      if (data.follower) return true;

      return roomUserAPI.update(data.id, {
        follower: true,
        lastFollowDate: format(+new Date())
      });
    }

    return roomUserAPI.create({
      roomId: roomId,
      userId: userId,
      follower: true,
      firstFollowDate: format(+new Date()),
      lastFollowDate: format(+new Date())
    });
  }

  async unfollow(roomId: number, userId: number) {
    const data = await roomUserAPI.getPure(userId, roomId);

    if (!data.follower) return true;

    return roomUserAPI.update(data.id, {
      follower: false,
      lastUnfollowDate: format(+new Date())
    });
  }
}