const testRoom = {
  id: 1,
  name: 'ravecat',
  title: 'RaveCat',
  avatar: 'https://pp.userapi.com/c626221/v626221510/7026b/zKYk5tlr530.jpg',
  mode: null,
  followerMode: false,
  slowMode: true,
  followersCount: 2140124,
  connectionsCount: 41593,
  usersCount: 41000,
  guestsCount: 593
};

const testRoom2 = {
  id: 2,
  name: 'neuropunk',
  title: 'Neuropunk',
  avatar: 'https://pp.userapi.com/c636226/v636226961/3728d/ghYiDWcd7fQ.jpg',
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