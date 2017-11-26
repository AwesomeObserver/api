import * as passport from 'koa-passport';
import { Strategy } from 'passport-google-oauth2';

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_SECRET,
  GOOGLE_CALLBACK_URL
} = process.env;

export default function(router, authEnd, GG) {

  const UserSocial = GG.API.UserSocial;

  passport.use(new Strategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL,
    passReqToCallback: true
  }, (request, accessToken, refreshToken, profile, done) => {
    process.nextTick(async function() {

      let user = await UserSocial.getByGoogleId(profile._json.id)

      if (!user) {
        user = await UserSocial.createFromGoogle({
          name: profile.displayName,
          googleId: profile.id,
          email: profile.email,
          avatar: profile._json.image.url
        });
      }
      
      done(null, { userId: user.id });
    });
  }));
  
  router.get('/auth/google/:connectionAuthKey',
    (ctx, next) => {
      ctx.session.cak = ctx.params.connectionAuthKey;
      next();
    },
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  router.get('/authend/google',
    passport.authenticate('google', { failureRedirect: '/' }),
    authEnd
  );
}