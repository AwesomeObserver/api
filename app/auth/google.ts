import { Strategy } from 'passport-google-oauth2';

export default {
	name: 'google',
	Strategy,
	strategyOptions: {
		clientID: process.env.GOOGLE_CLIENT_ID,
		clientSecret: process.env.GOOGLE_SECRET
	},
	getData: (profile) => ({
		serviceId: profile._json.id,
		serviceName: 'google',
		name: profile.displayName,
		email: profile.email,
		avatar: profile._json.image.url
	}),
	authOptions: {
		scope: [ 'profile', 'email' ]
	}
};