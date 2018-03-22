import { getManager, getRepository } from "typeorm";
import { broker } from 'core/broker';
import { logger } from 'core/logger';
import { pubSub } from 'core/pubsub';
import { UserSocial as UserSocialEntity } from 'app/entity/UserSocial';

export const setupUserSocialService = () => {
  const repository = getRepository(UserSocialEntity);
  const manager = getManager();

  return broker.createService({
    name: "userSocial",
    actions: {
      auth: async (ctx) => {
        const { serviceData } = ctx.params;
        const { serviceName, serviceId } = serviceData;

        let userSocial = await repository.findOne({ serviceName, serviceId });

        if (userSocial) {
          await repository.update(userSocial, serviceData);
          return userSocial.userId;
        }

        const user: any = await broker.call('user.create');

        const userSocialData = {
          userId: user.id,
          ...serviceData
        };

        let newUserSocial = new UserSocialEntity();

        for (const name of Object.keys(userSocialData) ) {
          newUserSocial[name] = userSocialData[name];
        }

        await manager.save(newUserSocial);

        return user.id;
      }
    }
  });
}