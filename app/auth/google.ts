import { Strategy } from 'passport-google-oauth2';

export default {
	name: 'google',
	Strategy,
	strategyOptions: {
		clientID: process.env.GOOGLE_CLIENT_ID,
		clientSecret: process.env.GOOGLE_SECRET
	},
	whereUser: (profile) => ({
		googleId: profile._json.id
	}),
	createUser: (profile) => ({
		name: profile.displayName,
		googleId: profile.id,
		email: profile.email,
		avatar: profile._json.image.url
	}),
	authOptions: {
		scope: [ 'profile', 'email' ]
	}
};
