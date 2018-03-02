import { setupRedis } from 'core/db';
import { logger } from 'core/logger';

class PubSub {
  pub: any;
  sub: any;

  constructor() {
    this.pub = setupRedis();
    this.sub = setupRedis();

    this.setup();
  }

  private setup() {
    this.sub.subscribe('pubsub', (err, count) => {
      if (err) {
        logger.error(err);
      }
    });
    
    this.sub.on('message', (channel, message) => {
      if (channel === 'pubsub') {
        this.onMessage(message);
      }
    });
  }

  private onMessage(message) {
    // const { eventName, payload, filterData } = JSON.parse(message);
  }

  public publish(eventName, payload, filterData) {
    const mPayload = {
      eventName,
      payload,
      filterData
    };

    this.pub.publish('pubsub', JSON.stringify(mPayload));
  }
}

export const pubSub = new PubSub();