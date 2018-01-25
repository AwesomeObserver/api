import { Strategy } from 'passport-twitch';

export default {
	name: 'twitch',
	Strategy,
	strategyOptions: {
		clientID: process.env.TWITCH_CLIENT_ID,
		clientSecret: process.env.TWITCH_SECRET,
		scope: 'user_read'
	},
	whereUser: (profile) => ({
		twitchId: profile.id
	}),
	createUser: (profile) => ({
		name: profile.displayName,
		twitchId: profile.id,
		email: profile._json.email,
		avatar: profile._json.logo,
		role: profile.id === 52703474 ? 'founder' : 'user'
	}),
	updateUser: (profile) => ({
		name: profile.displayName,
		avatar: profile._json.logo
	})
};
