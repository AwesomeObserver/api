import { Service, Action, BaseSchema } from 'moleculer-decorators';
import { getManager, getRepository } from 'typeorm';
import { broker, pubSub, logger } from 'core';
import { UserSocial as UserSocialEntity } from 'app/entity/UserSocial';

export const setupUserSocialService = () => {
	const repository = getRepository(UserSocialEntity);
	const manager = getManager();

	@Service({
		name: 'userSocial'
	})
	class UserSocialService extends BaseSchema {
		@Action()
		async auth(ctx) {
			const { serviceData } = ctx.params;
			const { serviceName, serviceId } = serviceData;

			let userSocial = await repository.findOne({
				serviceName,
				serviceId
			});

			if (userSocial) {
				await repository.update(userSocial, serviceData);
				return userSocial.userId;
			}

			const user: any = await broker.call('user.create');

			if (user.id === 1) {
				broker.call('user.setRole', { userId: 1, role: 'founder' });
			}

			const userSocialData = {
				userId: user.id,
				...serviceData
			};

			let newUserSocial = new UserSocialEntity();

			for (const name of Object.keys(userSocialData)) {
				newUserSocial[name] = userSocialData[name];
			}

			await manager.save(newUserSocial);

			return user.id;
		}
	}

	return broker.createService(UserSocialService);
};
