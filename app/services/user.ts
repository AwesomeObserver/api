import { Service, Action, BaseSchema } from 'moleculer-decorators';
import { getManager, getRepository } from "typeorm";
import { broker } from 'core/broker';
import { logger } from 'core/logger';
import { pubSub } from 'core/pubsub';
import { User as UserEntity } from 'app/entity/User';

export const setupUserService = () => {
  const repository = getRepository(UserEntity);
  const manager = getManager();

  @Service({
    name: 'user'
  })
  class UserService extends BaseSchema {

    //@ts-ignore
    @Action({
      cache: {
        keys: ["userId"]
      },
      params: {
        userId: "number"
      }
    })
    async getOne(ctx) {
      const { userId } = ctx.params;
      let user = await repository.findOne({
        where: { userId },
        relations: ['social']
      });
  
      if (!userId) return null;
      if (!user.name) user.name = user.social[0].name;
      if (!user.avatar) user.avatar = user.social[0].avatar;
  
      return user;
    }

    @Action()
    async create(ctx) {
      const { userData } = ctx.params;
      let user = new UserEntity();

      if (typeof userData == 'object') {
        for (const name of Object.keys(userData)) {
          user[name] = userData[name];
        }
      }

      return manager.save(user);
    }

    @Action()
    async update(ctx) {
      const { userId, data } = ctx.params;
      await repository.updateById(userId, data);
      await broker.cacher.del(`user.getOne:${userId}`);
      return broker.call('user.getOne', { userId });
    }
    
    @Action()
    async ban(ctx) {
      const { userId } = ctx.params;
      const res = await broker.call('user.update', {
        userId,
        data: { banned: true }
      });
      pubSub.publish('userBanned', null, { userId });
      return res;
    }
    
    @Action()
    async setRole(ctx) {
      const { userId, role } = ctx.params;
      const res = await broker.call('user.update', {
        userId,
        data: { role }
      });
      pubSub.publish('userRoleChanged', role, { userId });
      return res;
    }
  }

  return broker.createService(UserService);
}