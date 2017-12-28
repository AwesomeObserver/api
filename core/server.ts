import * as koa from 'koa';
import * as cors from 'koa2-cors';
import * as koaBody from 'koa-bodyparser';
import * as koaRouter from 'koa-router';
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';
import { buildSchema } from './schema';
import { setupAuth } from './auth';
import { setupDB } from './db';
import { wsAPI } from './wsapi';
import { connectionAPI } from 'app/api';

export class RPServer {

  API_PORT: number;
  WSAPI_PORT: number;

  constructor() {
    this.API_PORT = 8200;
    this.WSAPI_PORT = 8000;
  }

  async setupGQL() {
    const schema = buildSchema();
    const app = new koa();
    const router = new koaRouter();

    app.use(koaBody());
    app.use(cors());

    router.post('/graphql', graphqlKoa(function(req) {
      const token = req.request.header.token;
      let userId = null;

      if (token) {
        userId = connectionAPI.checkToken(token);
      }

      return {
        schema,
        context: {
          userId
        }
      }
    }));

    router.get('/graphiql', graphiqlKoa({
      endpointURL: `http://localhost/graphql`
    }));

    app.use(router.routes());
    app.use(router.allowedMethods());

    app.on('error', function(err) {
      // console.log(err);
    });

    app.listen(this.API_PORT);
  }

  async setupWSAPI() {
    wsAPI.PORT = this.WSAPI_PORT;
    return wsAPI.run();
  }

  async run() {
    await setupDB();
    await setupAuth();
    await this.setupGQL();
    await this.setupWSAPI();
  }
}