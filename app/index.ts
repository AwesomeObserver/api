import { agenda, redis } from 'core/db';
import { instanceId } from 'core/config';
import { wsAPI } from 'core/wsapi';
import { objFilter } from 'core/utils';
import { logger } from 'core/logger';
import { broker } from 'core/broker';
import { roomModeWaitlistAPI } from 'app/api';
import { setupConnectionService } from 'app/services/connection';
import { setupWsService } from 'app/services/wsapi';

export async function startup() {
  logger.info(`API Server is ready`);

  agenda.define('waitlistPlayEnd', (job, done) => {
    roomModeWaitlistAPI.endPlay(job.attrs.data.roomId).then(() => done());
  });

  agenda.start();

  const hcTimeout = 2000;

  setInterval(() => {
    redis.hset('ihc', instanceId, +new Date());
  }, 2000);

  setInterval(async () => {
    const instances = await redis.hgetall(`ihc`);

    Object.keys(instances).forEach(instanceName => {
      const diff = +new Date() - instances[instanceName];

      if (diff > (hcTimeout + 1000)) {
        broker.call("connection.clearInstance", {
          instanceId: instanceName
        }).then(() => {
          redis.hdel('ihc', instanceName);          
        });
      }
    });
  }, 5000);

  setupConnectionService();
  setupWsService();
}