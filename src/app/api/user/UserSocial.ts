const testUser = {
  id: 1,
  name: 'Sygeman',
  avatar: "https://lh5.googleusercontent.com/-zU1N7a_fNCY/AAAAAAAAAAI/AAAAAAAAD44/cS1l5HDFDac/photo.jpg?sz=50",
  role: 'founder',
  isTester: false,
  isBanned: false,
  unbanDate: null
};

export default class {

  GG: any;

  constructor(GG) {
    this.GG = GG;
  }

  async createUser(userData) {
    return this.GG.API.User.create(userData);
  }

  async getUser(where) {
    return this.GG.API.User.getOne(where);
  }

  async createFromGoogle(userData) {
    return this.createUser(userData);
  }
  
  async createFromVK(userData) {
    return this.createUser(userData);
  }
  
  async createFromTwitch(userData) {
    return this.createUser(userData);
  }
  
  async getByGoogleId(googleId: String) {
    return this.getUser({ googleId });
  }
  
  async getByVKId(vkId: String) {
    return this.getUser({ vkId });
  }
  
  async getByTwitchId(twitchId: String) {
    return this.getUser({ twitchId });
  }
}