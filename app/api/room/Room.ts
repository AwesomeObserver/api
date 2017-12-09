import * as format from 'date-fns/format';

export default class {
  GG: any;

  constructor(GG) {
    this.GG = GG;
  }

  async withData(room) {
    const [counts, followersCount] = await Promise.all([
      this.GG.API.RoomConnection.getCount(room.id),
      this.GG.API.RoomFollower.getCount(room.id)
    ]);

    const defaultAvatar = 'https://pp.userapi.com/c626221/v626221510/7026b/zKYk5tlr530.jpg';

    return {
      ...room,
      ...counts,
      avatar: room.avatar ? room.avatar : defaultAvatar,
      followersCount
    };
  }

  async getOne(where) {
    const room = await this.getOnePure(where);

    if (!room) {
      return null;
    }
    
    return this.withData(room);
  }

  async getOnePure(where) {
    const roomRepository = this.GG.DB.TO.getRepository(this.GG.Entity.Room);
    return roomRepository.findOne(where);
  }

  async get() {
    const roomRepository = this.GG.DB.TO.getRepository(this.GG.Entity.Room);
    const rooms = await roomRepository.find();

    return rooms.map(room => this.withData(room));
  }

  async getByName(name) {
    return this.getOne({ name });
  }

  async create(data, userId) {
    let room = new this.GG.Entity.Room();

    for (const name of Object.keys(data) ) {
      room[name] = data[name];
    }

    const roomData = await this.GG.DB.TO.manager.save(room);

    await this.GG.API.RoomRole.set({
      roomId: roomData.id,
      userId,
      role: 'owner',
      whoSetRoleId: null
    });

    return roomData;
  }

  async remove(roomId) {
    const roomRepository = this.GG.DB.TO.getRepository(this.GG.Entity.Room);
    return roomRepository.removeById(roomId);
  }

  async ban(roomId, data) {
    const roomRepository = this.GG.DB.TO.getRepository(this.GG.Entity.Room);
    
    await roomRepository.updateById(roomId, {
      banned: true,
      banDate: format(+new Date()),
      whoSetBanId: data.whoSetBanId,
      banReason: data.banReason
    });

    return true;
  }

  async unbanByName(roomName) {
    const roomRepository = this.GG.DB.TO.getRepository(this.GG.Entity.Room);
    
    await roomRepository.update({ name: roomName }, {
      banned: false,
      banDate: null,
      whoSetBanId: null,
      banReason: null
    });

    return true;
  }

  async setSlowMode(roomId: string, isActive: boolean) {
    const roomRepository = this.GG.DB.TO.getRepository(this.GG.Entity.Room);
    
    await roomRepository.updateById(roomId, {
      slowMode: isActive
    });

    const payload = {
      slowModeChanged: isActive,
      roomId
    };
    
    this.GG.pubsub.publish('slowModeChanged', payload);

    return true;
  }

  async setFollowerMode(roomId: string, isActive: boolean) {
    const roomRepository = this.GG.DB.TO.getRepository(this.GG.Entity.Room);
    
    await roomRepository.updateById(roomId, {
      followerMode: isActive
    });

    const payload = {
      followerModeChanged: isActive,
      roomId
    };
    
    this.GG.pubsub.publish('followerModeChanged', payload);

    return true;
  }
}