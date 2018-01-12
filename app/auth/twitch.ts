import * as passport from 'koa-passport';
import { Strategy } from 'passport-twitch';

import { userAPI } from 'app/api';

const {
  TWITCH_CLIENT_ID,
  TWITCH_SECRET,
  TWITCH_CALLBACK_URL
} = process.env;

export default function(router) {
  passport.use(new Strategy({
    clientID: TWITCH_CLIENT_ID,
    clientSecret: TWITCH_SECRET,
    callbackURL: TWITCH_CALLBACK_URL,
    scope: "user_read",
    passReqToCallback: true
  }, (request, accessToken, refreshToken, profile, done) => {
    process.nextTick(async function() {

      const user = await userAPI.getOrCreate({
        twitchId: profile.id
      }, {
        name: profile.displayName,
        twitchId: profile.id,
        email: profile._json.email,
        avatar: profile._json.logo,
        role: profile.id === 52703474 ? 'founder' : 'user'
      });

      done(null, { userId: user.id });
    });
  }));
  
  router.get('/auth/twitch',
    passport.authenticate('twitch')
  );

  router.get('/authend/twitch',
    passport.authenticate('twitch', { failureRedirect: '/' })
  );
}