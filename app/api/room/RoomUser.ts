import * as isAfter from 'date-fns/is_after';

export default class {

  GG: any;

  constructor(GG) {
    this.GG = GG;
  }

  getDefaultRoomUser(userId: string, roomId: string) {
    return {
      userId,
      roomId,
      follower: false,
      firstFollowDate: null,
      lastFollowDate: null,
      lastUnfollowDate: null,
      role: 'user',
      whoSetRoleId: null,
      lastRole: 'user',
      banDate: null,
      unbanDate: null,
      whoSetBanId: null,
      banReason: null
    };
  }

  withFormat(roomUser) {
    const unbanDate = roomUser.unbanDate;
    roomUser.banned = !!unbanDate ? isAfter(unbanDate, +new Date()) : false;
    return roomUser;
  }

  async getOne(userId: string, roomId: string) {
    let userRepository = this.GG.DB.TO.getRepository(this.GG.Entity.RoomUser);
    let data = await userRepository.findOne({ userId, roomId });

    if (!data) {
      data = this.getDefaultRoomUser(userId, roomId);
    }

    return this.withFormat(data);
  }

  async getOneFull(userId: string, roomId: string) {
    return Promise.all([
      this.GG.API.User.getById(userId),
      this.GG.API.RoomUser.getOne(userId, roomId)
    ]).then(([ site, room ]) => ({ site, room }));
  }

  async getOnline(roomId: string) {
    const key = `rooms:${roomId}:users:connections`;
    const usersOnline = await this.GG.DB.Redis.hgetall(key);
    
    const users = [];
  
    for (const userId of Object.keys(usersOnline)) {
      if (usersOnline[userId] > 0) {
        users.push(this.getOneFull(userId, roomId));
      }
    }

    return users;
  }
}