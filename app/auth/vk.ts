import { Strategy } from 'passport-vkontakte';

export default {
	name: 'vkontakte',
	Strategy,
	strategyOptions: {
		clientID: process.env.VK_CLIENT_ID,
		clientSecret: process.env.VK_SECRET
	},
	getData: (profile) => ({
		serviceId: profile.id,
		serviceName: 'vk',
		name: profile.displayName,
		avatar: profile._json.photo
	})
};
