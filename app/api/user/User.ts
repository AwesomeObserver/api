import { getConnection } from "typeorm";
import { pgClient, redis } from 'core/db';
import { User as UserEntity } from 'app/entity/User';
import { pubSub } from 'core/pubsub';
import { cacheAPI } from 'app/api';

export class UserAPI {

  get repository() {
    return getConnection().getRepository(UserEntity);
  }

  get manager() {
    return getConnection().manager;
  }

  async getByIdFromDB(userId: number) {
    if (!userId) {
      return null;
    }

    const res = await pgClient.query(`
      SELECT *
      FROM "user" u
      WHERE u.id = ${userId}
    `);

    if (res.rows.length === 0) {
      return null;
    }

    return res.rows[0];
  }

  async getById(userId: number) {
    const key = `users:${userId}`;
    let [inCache, res] = await cacheAPI.get(key);

    if (!inCache) {
      res = await this.getByIdFromDB(userId);
      cacheAPI.set(key, res);
    }

    return res;
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
    await this.repository.updateById(id, data);
    
    const res = await this.getByIdFromDB(id);

		const key = `users:${id}`;
		cacheAPI.set(key, res);

		return res;
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