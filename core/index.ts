import { RPServer } from './server';
import { startup } from '../app';

(async () => {
  const server = new RPServer();
  await server.run();
  startup();
})();