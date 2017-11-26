const testRoom = {
  id: 1,
  name: 'ravecat',
  title: 'RaveCat',
  avatar: 'https://pp.userapi.com/c626221/v626221510/7026b/zKYk5tlr530.jpg',
  mode: null,
  followerMode: false,
  slowMode: false,
  followersCount: 140124,
  connectionsCount: 1593,
  usersCount: 1103,
  guestsCount: 490
};

export default class {
  GG: any;

  constructor(GG) {
    this.GG = GG;
  }

  async getRoomByName(roomName) {
    return testRoom;
  }

  async getRooms() {
    return [testRoom];
  }
}