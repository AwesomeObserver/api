import { Strategy } from 'passport-twitch';

export default {
	name: 'twitch',
	Strategy,
	strategyOptions: {
		clientID: process.env.TWITCH_CLIENT_ID,
		clientSecret: process.env.TWITCH_SECRET,
		scope: 'user_read'
	},
	getData: (profile) => ({
		serviceId: profile.id,
		serviceName: 'twitch',
		name: profile.displayName,
		email: profile._json.email,
		avatar: profile._json.logo
	})
};
