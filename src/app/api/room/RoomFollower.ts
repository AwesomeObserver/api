export default class {

  GG: any;

  constructor(GG) {
    this.GG = GG;
  }

  async getCount(roomId: string) {
    let userRepository = this.GG.DB.TO.getRepository(this.GG.Entity.RoomUser);
    return userRepository.count({ roomId, follower: true });
  }

  async follow(roomId: string, userId: string) {
    let userRepository = this.GG.DB.TO.getRepository(this.GG.Entity.RoomUser);
    let data = await userRepository.findOne({ userId, roomId });

    if (data) {
      if (data.follower) {
        return true;
      }

      return userRepository.updateById(data.id, {
        follower: true
      });
    } else {
      let roomUser = new this.GG.Entity.RoomUser();
      roomUser.roomId = roomId;
      roomUser.userId = userId;
      roomUser.follower = true;
      return userRepository.save(roomUser);
    }
  }

  async unfollow(roomId: string, userId: string) {
    let userRepository = this.GG.DB.TO.getRepository(this.GG.Entity.RoomUser);
    let data = await userRepository.findOne({ userId, roomId });

    if (!data.follower) {
      return true;
    }

    return userRepository.updateById(data.id, {
      follower: false
    });
  }
}