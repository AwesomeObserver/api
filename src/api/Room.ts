const testRoom = {
  id: 1,
  name: 'ravecat',
  title: 'RaveCat',
  avatar: 'https://pp.userapi.com/c626221/v626221510/7026b/zKYk5tlr530.jpg',
  mode: null,
  followerMode: false,
  slowMode: false,
  followersCount: 2140124,
  connectionsCount: 1593,
  usersCount: 1103,
  guestsCount: 490
};

const testRoom2 = {
  id: 2,
  name: 'test',
  title: 'Test',
  avatar: 'https://pp.userapi.com/c626221/v626221510/7026b/zKYk5tlr530.jpg',
  mode: null,
  followerMode: false,
  slowMode: false,
  followersCount: 40124,
  connectionsCount: 93,
  usersCount: 90,
  guestsCount: 3
};

export default class {
  GG: any;

  constructor(GG) {
    this.GG = GG;
  }

  async getRoomByName(roomName) {
    if (roomName == 'ravecat') {
      return testRoom;  
    }
    
    return testRoom2;
  }

  async getRooms() {
    return [testRoom, testRoom2];
  }
}