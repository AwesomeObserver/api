import { User } from './User';

export class UserSocialClass {

  async createUser(userData) {
    return User.create(userData);
  }

  async getUser(where) {
    return User.getOne(where);
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

export const UserSocial = new UserSocialClass();