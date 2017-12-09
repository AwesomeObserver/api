import * as passport from 'koa-passport';
import { Strategy } from 'passport-twitch';

import { UserSocial } from 'app/api/user/UserSocial';

const {
  TWITCH_CLIENT_ID,
  TWITCH_SECRET,
  TWITCH_CALLBACK_URL
} = process.env;

export default function(router, authEnd) {
  passport.use(new Strategy({
    clientID: TWITCH_CLIENT_ID,
    clientSecret: TWITCH_SECRET,
    callbackURL: TWITCH_CALLBACK_URL,
    scope: "user_read",
    passReqToCallback: true
  }, (request, accessToken, refreshToken, profile, done) => {
    process.nextTick(async function() {

      let user = await UserSocial.getByTwitchId(profile.id)
      
      if (!user) {
        user = await UserSocial.createFromTwitch({
          name: profile.displayName,
          twitchId: profile.id,
          email: profile._json.email,
          avatar: profile._json.logo
        });
      }
            
      done(null, { userId: user.id });
    });
  }));
  
  router.get('/auth/twitch/:connectionAuthKey',
    (ctx, next) => {
      ctx.session.cak = ctx.params.connectionAuthKey;
      next();
    },
    passport.authenticate('twitch')
  );

  router.get('/authend/twitch',
    passport.authenticate('twitch', { failureRedirect: '/' }),
    authEnd
  );
}