import { ServiceBroker } from 'moleculer';
import { logger } from 'core/logger';

export let broker = new ServiceBroker({
  transporter: "nats://nats:4222",
  cacher: process.env.REDIS_URL,
  logger
});

broker.start();