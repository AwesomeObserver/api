import * as koa from 'koa';
import * as cors from 'koa2-cors';
import * as passport from 'koa-passport';
import * as koaSession from 'koa-session';
import * as koaBody from 'koa-bodyparser';
import * as koaRouter from 'koa-router';
import { getFolderData } from './utils';

const authDir = __dirname + '/../auth/';

function setupServices(...args) {
  const AuthServices = getFolderData(authDir);
  
  for (const APIName of Object.keys(AuthServices)) {
    AuthServices[APIName].default(...args);
  }
}

export async function setupAuth(GG) {
  const PORT = 8500;
  const app = new koa();
  const router = new koaRouter();
  
  app.keys = [process.env.SESSION_SECRET];
  app.use(koaSession({}, app));

  app.use(koaBody());

  app.use(passport.initialize());
  app.use(passport.session());

  const authEnd = (ctx) => {
    const connectionKey = ctx.session.cak;
    const userId = ctx.session.passport.user.userId;
    
    GG.API.Connection.auth(connectionKey, userId);

    ctx.type = 'html';
    ctx.body = `
      <!DOCTYPE html>
      <html>
        <header><title>Auth End</title></header>
        <body>
          <div>Close this tab</div>
        </body>
      </html>
    `;
  }
  
  setupServices(router, authEnd, GG);
  
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((obj, cb) => cb(null, obj));
  
  router.get('/logout', ctx => ctx.logout());

  app.use(router.routes());
  app.use(router.allowedMethods());
  
  app.listen(PORT);
}