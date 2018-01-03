import { getConnection } from "typeorm";
import { User as UserEntity } from 'app/entity/User';

export class UserAPI {

  get repository() {
    return getConnection().getRepository(UserEntity);
  }

  get manager() {
    return getConnection().manager;
  }

  async getById(userId: number) {
    return this.getOne({ id: userId });
  }

  async getOne(where) {
    return this.repository.findOne({ where, cache: true });
  }

  async create(userData) {
    let user = new UserEntity();

    for (const name of Object.keys(userData) ) {
      user[name] = userData[name];
    }

    return this.manager.save(user);
  }

  async getOrCreate(where, data) {
    let user = await this.getOne(where);

    if (!user) {
      user = await this.create(data);
    }

    return user;
  }

  async ban(userId: number) {

  }

  async unban(userId: number) {

  }

  async setRole(userId: number, role: string) {
    
  }
}