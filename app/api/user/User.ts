import { getConnection } from "typeorm";
import { User as UserEntity } from 'app/entity/User';
import { pubSub } from 'core/pubsub';

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
    return this.repository.findOne({ where });
  }

  async create(userData) {
    let user = new UserEntity();

    for (const name of Object.keys(userData) ) {
      user[name] = userData[name];
    }

    return this.manager.save(user);
  }

  async update(id, data) {
    return this.repository.updateById(id, data);
  }

  async getOrCreate(where, data) {
    let user = await this.getOne(where);

    if (!user) {
      user = await this.create(data);
    }

    return user;
  }

  async ban(userId: number) {
    const data = await this.getById(userId);

    if (!data) return false;

    const res = await this.update(data.id, { banned: true });

    pubSub.publish('userBanned', null, { userId });

    return res;
  }

  // async unban(userId: number) {

  // }

  async setRole(userId: number, role: string) {
    console.log(userId, role);

    const data = await this.getById(userId);

    if (!data) return false;

    const res = await this.update(data.id, { role });

    pubSub.publish('userRoleChanged', role, { userId });

    return res;
  }
}