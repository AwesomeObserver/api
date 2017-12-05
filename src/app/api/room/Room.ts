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
    const roomRepository = this.GG.DB.TO.getRepository(this.GG.Entity.Room);
    const room = await roomRepository.findOne(where);
    
    return this.withData(room);
  }

  async get() {
    const roomRepository = this.GG.DB.TO.getRepository(this.GG.Entity.Room);
    const rooms = await roomRepository.find();

    return rooms.map(room => this.withData(room));
  }

  async getByName(name) {
    return this.getOne({ name });
  }

  async create(data) {
    let room = new this.GG.Entity.Room();

    for (const name of Object.keys(data) ) {
      room[name] = data[name];
    }

    return this.GG.DB.TO.manager.save(room);
  }

  async remove(roomId) {
    const roomRepository = this.GG.DB.TO.getRepository(this.GG.Entity.Room);
    return roomRepository.removeById(roomId);
  }

  async ban(roomId, data) {
    
  }

  async setSlowMode(roomId: string, isActive: boolean) {

  }

  async setFollowerMode(roomId: string, isActive: boolean) {
    
  }
}