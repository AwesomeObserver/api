import { ServiceBroker } from 'moleculer';
import { logger } from 'core/logger';

export let broker = new ServiceBroker({
	transporter: process.env.NATS_URL,
	logger,
	logLevel: 'warn', //process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
	cacher: {
		type: 'Redis',
		options: {
			ttl: 86400,
			redis: process.env.REDIS_URL
		}
	}
});

broker.start();
