import * as koa from 'koa';
import * as cors from 'koa2-cors';
import * as koaBody from 'koa-bodyparser';
import * as koaRouter from 'koa-router';
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';
import { createServer } from 'http';
import schema from './gql';

export async function runServer() {
  const app = new koa();
  const router = new koaRouter();
  const PORT = 8080;

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

  router.post('/graphql', graphqlKoa({ schema }));
  router.get('/graphiql', graphiqlKoa({
    endpointURL: '/graphql',
    subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`
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
        onConnect: (connectionParams, webSocket) => {
          // console.log('onConnect');
        },
        onDisconnect: (webSocket) => {
          // console.log('onDisconnect');
        }
      }, {
        server: ws,
        path: '/subscriptions',
      });

      resolve(PORT);
    });
  });
}