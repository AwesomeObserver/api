import * as koa from 'koa';
import * as cors from 'koa2-cors';
import * as koaBody from 'koa-bodyparser';
import * as koaRouter from 'koa-router';
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';
import { createServer } from 'http';
import schema from './gql';
import pubsub from './pubsub';
import { setupAPI } from './api';
import { setupDB } from './db';
import { getEntites } from './entity';

export async function runServer() {
  const app = new koa();
  const router = new koaRouter();
  const PORT = 8000;

  let GG = {
    pubsub
  };

  GG['DB'] = await setupDB();
  GG['Entity'] = await getEntites();
  GG['API'] = setupAPI(GG);

  app.use(cors({ 
    origin(ctx) {
      if (ctx.url !== '/graphql') {
        return false;
      }
      return '*';
    },
    credentials: true
  }));
  app.use(koaBody());

  router.get('/graphiql', graphiqlKoa({
    endpointURL: `ws://localhost:${PORT}/graphql`,
    subscriptionsEndpoint: `ws://localhost:${PORT}/graphql`
  }));

  app.use(router.routes());
  app.use(router.allowedMethods());

  const ws = createServer(app.callback());

  return new Promise(resolve => {
    ws.listen(PORT, () => {
      new SubscriptionServer({
        execute,
        subscribe,
        schema,
        onConnect: (...args) => {
          return GG['API'].Connection.onConnect(...args);
        },
        onDisconnect: (...args) => {
          return GG['API'].Connection.onDisconnect(...args);
        }
      }, {
        server: ws,
        path: '/graphql',
      });

      resolve(GG);
    });
  });
}