import { runServer } from './core/setup';
import pubsub from './core/pubsub';
import { randomBytes } from 'crypto';

runServer().then((PORT) => {
  console.log(`API Server is now running on http://localhost:${PORT}`);

  setInterval(() => {
    const messageId = randomBytes(10).toString('hex');

    const payload = {
      messageAdded: {
        id: messageId,
        content: +new Date(),
      }
    };

    pubsub.publish('messageAdded', payload);
  }, 2000);
});