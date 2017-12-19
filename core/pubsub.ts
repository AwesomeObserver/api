import * as ioRedis from 'ioredis';
import { wsAPI } from 'core/wsapi';

const { REDIS_URL } = process.env;

export function objFilter(dataObj: Object, filterObj?: Object): boolean {
  if (!filterObj) {
    return true;
  }

  let pass = true;
  
  for (let name of Object.keys(filterObj)) {
    let isEqual = filterObj[name] === dataObj[name];
    
    if (!isEqual) {
      pass = false;
      break;
    }
  }

  return pass;
}

class PS {

  public publish(eventName, payload, filterData) {
    // console.log({ eventName, payload, filterData });
    wsAPI.send(eventName, payload, (cdata) => objFilter(cdata, filterData));
  }

}

export const PubSub = new PS();