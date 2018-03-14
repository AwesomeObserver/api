import { broker } from 'core/broker';

class PubSub {

  public publish(eventName, payload, filterData) {
    broker.broadcast("wsapi.publish", {
      eventName, payload, filterData
    });
  }

}

export const pubSub = new PubSub();