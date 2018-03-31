import { RPServer } from './server';
import { startup } from '../app';

(async () => {
	const server = new RPServer();
	await server.run();
	startup();
})();

export * from './access';
export * from './actionTime';
export * from './broker';
export * from './pubsub';
export * from './logger';
