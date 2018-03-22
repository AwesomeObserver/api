import { ServiceBroker } from 'moleculer';
import { logger } from 'core/logger';

export let broker = new ServiceBroker({
  transporter: "nats://nats:4222",
  logger,
  cacher: {
    type: "Redis",
    options: {
      ttl: 86400,
      redis: process.env.REDIS_URL
    }
  }
});

broker.start();