import * as koa from 'koa';
import * as cors from 'koa2-cors';
import * as koaBody from 'koa-bodyparser';
import * as koaRouter from 'koa-router';
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';
import { schema } from './gql';
import { setupAuth } from './auth';
import { setupDB } from './db';
import { wsAPI } from './wsapi';

export class RPServer {

  API_PORT: number;
  WSAPI_PORT: number;

  constructor() {
    this.API_PORT = 8200;
    this.WSAPI_PORT = 8000;
  }

  async setupGQL() {
    const app = new koa();
    const router = new koaRouter();

    app.use(koaBody());

    router.post('/graphql', graphqlKoa({ schema }));
    router.get('/graphiql', graphiqlKoa({
      endpointURL: `http://localhost/graphql`
    }));

    app.use(router.routes());
    app.use(router.allowedMethods());

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