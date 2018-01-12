import * as koa from 'koa';
import * as cors from 'koa2-cors';
import * as passport from 'koa-passport';
import * as koaSession from 'koa-session';
import * as koaBody from 'koa-bodyparser';
import * as koaRouter from 'koa-router';
import * as RedisStore from 'koa-redis';
import koaCookie from 'koa-cookie';
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';
import { buildSchema } from './schema';
import { setupAuth } from './auth';
import { setupDB } from './db';
import { wsAPI } from './wsapi';
import { connectionAPI } from 'app/api';
import { getFolderData } from './utils';

const authDir = __dirname + '/../app/auth/';

function setupServices(...args) {
  const AuthServices = getFolderData(authDir);
  
  for (const APIName of Object.keys(AuthServices)) {
    AuthServices[APIName].default(...args);
  }
}

export class RPServer {

  API_PORT: number;
  WSAPI_PORT: number;
  app: any;
  router; any;

  constructor() {
    this.API_PORT = 8200;
    this.WSAPI_PORT = 8000;
    this.app = null;
    this.router = null;
  }

  setupHttp() {
    this.app = new koa();
    this.router = new koaRouter();

    this.router.use(koaCookie());

    this.app.use(koaBody());
    this.app.use(cors());

    this.setupAuth();
    this.setupGQL();
    
    this.app.use(this.router.routes());
    this.app.use(this.router.allowedMethods());
  }

  async setupAuth() {
    this.app.keys = [process.env.SESSION_SECRET];
    this.app.use(koaSession({
      store: new RedisStore({
        host: "redis",
        port: 6379
      })
    }, this.app));

    setupServices(this.router);

    this.app.use(passport.initialize());
    this.app.use(passport.session());

    passport.serializeUser((user, cb) => cb(null, user));
    passport.deserializeUser((obj, cb) => cb(null, obj));
    
    this.router.get('/logout', ctx => ctx.logout());
  }

  async setupGQL() {
    const schema = buildSchema();
    
    this.router.post('/graphql', graphqlKoa(function(ctx) {
      const token = ctx.request.header.token;

      return {
        schema,
        debug: false,
        context: {
          userId: ctx.state.user ? ctx.state.user.userId : null
        }
      }
    }));

    this.app.listen(this.API_PORT);
  }

  async setupWSAPI() {
    wsAPI.PORT = this.WSAPI_PORT;
    return wsAPI.run();
  }

  async run() {
    this.setupHttp();

    await setupDB();
    await this.setupWSAPI();
  }
}