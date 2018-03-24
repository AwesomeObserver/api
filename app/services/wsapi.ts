import { Service, Event, BaseSchema } from 'moleculer-decorators';
import { wsAPI } from 'core/wsapi';
import { objFilter } from 'core/utils';
import { broker } from 'core/broker';

export const setupWsService = () => {
  @Service({
    name: 'wsapi'
  })
  class WSAPIService extends BaseSchema {
    @Event()
    'wsapi.publish'(ctx) {
      const { eventName, payload, filterData } = ctx;
      wsAPI.send(eventName, payload, (cdata) => objFilter(cdata, filterData));
    }
  }

  return broker.createService(WSAPIService);
}