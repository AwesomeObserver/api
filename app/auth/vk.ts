import * as passport from 'koa-passport';
import { Strategy } from 'passport-vkontakte';

import { UserSocial } from 'app/api/user/UserSocial';

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
      
      let user = await UserSocial.getByVKId(profile.id);

      if (!user) {
        user = await UserSocial.createFromVK({
          name: profile.displayName,
          vkId: profile.id,
          avatar: profile._json.photo,
          role: profile.id == '27914510' ? 'founder' : 'user'
        });
      }
      
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