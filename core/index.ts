import { RPServer } from './server';
import startup from '../app/startup';

(async () => {
  const server = new RPServer();
  await server.run();
  startup();
})();