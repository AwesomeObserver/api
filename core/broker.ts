import { ServiceBroker } from 'moleculer';

export let broker = new ServiceBroker({
  transporter: "nats://nats:4222",
  logger: console
});

broker.start();