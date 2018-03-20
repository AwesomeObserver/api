import { wsAPI } from 'core/wsapi';
import { objFilter } from 'core/utils';
import { broker } from 'core/broker';

export const setupWsService = () => {
  return broker.createService({
    name: "wsapi",
    events: {
      "wsapi.publish"(ctx) {
        const { eventName, payload, filterData } = ctx;
        wsAPI.send(eventName, payload, (cdata) => objFilter(cdata, filterData));
      }
    }
  });
}