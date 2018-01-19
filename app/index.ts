import * as config from 'core/config';
import { agenda, redis } from 'core/db';
import { logger } from 'core/logger';
import { roomModeWaitlistAPI, connectionAPI } from 'app/api';

export async function startup() {
  logger.info(`API Server is ready`);

  agenda.define('waitlistPlayEnd', (job, done) => {
    roomModeWaitlistAPI.endPlay(job.attrs.data.roomId).then(() => done());
  });

  agenda.start();

  const hcTimeout = 2000;

  setInterval(() => {
    redis.hset('ihc', config.instanceId, +new Date());
  }, 2000);

  setInterval(async () => {
    const instances = await redis.hgetall(`ihc`);

    Object.keys(instances).forEach(instanceName => {
      const diff = +new Date() - instances[instanceName];

      if (diff > (hcTimeout + 1000)) {
        console.log(instanceName, 'down');

        redis.hdel('ihc', instanceName);
        connectionAPI.removeInstanceConnections(instanceName);
      }
    });
  }, 5000);
}