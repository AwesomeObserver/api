import * as passport from 'koa-passport';
import { Strategy } from 'passport-vkontakte';

import { userAPI } from 'app/api';

const {
  VK_CLIENT_ID,
  VK_SECRET,
  VK_CALLBACK_URL
} = process.env;

export default function(router, authEnd) {
  passport.use(new Strategy({
    clientID: VK_CLIENT_ID,
    clientSecret: VK_SECRET,
    callbackURL: VK_CALLBACK_URL,
    passReqToCallback: true
  }, (request, accessToken, refreshToken, profile, done) => {
    process.nextTick(async function() {
      
      const user = await userAPI.getOrCreate({
        vkId: profile.id 
      }, {
        name: profile.displayName,
        vkId: profile.id,
        avatar: profile._json.photo
      });
      
      done(null, { userId: user.id });
    });
  }));
  
  router.get('/auth/vk/:connectionAuthKey',
    (ctx, next) => {
      ctx.session.cak = ctx.params.connectionAuthKey;
      next();
    },
    passport.authenticate('vkontakte')
  );

  router.get('/authend/vk',
    passport.authenticate('vkontakte', { failureRedirect: '/' }),
    authEnd
  );
}