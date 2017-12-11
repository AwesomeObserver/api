import * as koa from 'koa';
import * as cors from 'koa2-cors';
import * as koaBody from 'koa-bodyparser';
import * as koaRouter from 'koa-router';
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';
import { createServer } from 'http';
import schema from './gql';
import { setupAuth } from './auth';
import { Connection } from 'app/api/connection/Connection';

export async function runServer() {
  const app = new koa();
  const router = new koaRouter();
  const PORT = 8000;
  
  await setupAuth();

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

  // router.get('/graphiql', graphiqlKoa({
  //   endpointURL: `ws://localhost:${PORT}/graphql`,
  //   subscriptionsEndpoint: `ws://localhost:${PORT}/graphql`
  // }));

  app.use(router.routes());
  app.use(router.allowedMethods());

  const ws = createServer(app.callback());

  return new Promise(resolve => {
    ws.listen(PORT, () => {
      new SubscriptionServer({
        execute,
        subscribe,
        schema,
        keepAlive: 5 * 1000,
        onConnect: (connectionParams, webSocket) => {
          return Connection.onConnect(connectionParams, webSocket);
        },
        onDisconnect: (webSocket) => {
          return Connection.onDisconnect(webSocket);
        }
      }, {
        server: ws,
        path: '/graphql',
      });

      resolve();
    });
  });
}