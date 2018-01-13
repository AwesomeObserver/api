import { Strategy } from 'passport-vkontakte';

export default {
  name: 'vkontakte',
  Strategy,
  strategyOptions: {
    clientID: process.env.VK_CLIENT_ID,
    clientSecret: process.env.VK_SECRET,
    callbackURL: process.env.VK_CALLBACK_URL,
    passReqToCallback: true
  },
  whereUser: profile => ({
    vkId: profile.id
  }),
  createUser: profile => ({
    name: profile.displayName,
    vkId: profile.id,
    avatar: profile._json.photo
  })
};