import { getConnection } from "typeorm";
import { User as UserEntity } from 'app/entity/User';

export class UserClass {

  async getById(userId: number) {
    return this.getOne({ id: userId });
  }

  async getOne(where) {
    let userRepository = getConnection().getRepository(UserEntity);
    return userRepository.findOne({ where, cache: true });
  }

  async create(userData) {
    let user = new UserEntity();

    for (const name of Object.keys(userData) ) {
      user[name] = userData[name];
    }

    return getConnection().manager.save(user);
  }

  async ban(userId: number) {

  }

  async unban(userId: number) {

  }

  async setRole(userId: number, role: string) {
    
  }
}

export const User = new UserClass();