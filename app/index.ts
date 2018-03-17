import { agenda, redis } from 'core/db';
import { instanceId } from 'core/config';
import { wsAPI } from 'core/wsapi';
import { objFilter } from 'core/utils';
import { logger } from 'core/logger';
import { broker } from 'core/broker';
import {
  roomModeWaitlistAPI,
  connectionAPI,
  connectionEventsAPI,
  roomEventsAPI
} from 'app/api';

export async function startup() {
  logger.info(`API Server is ready`);

  agenda.define('waitlistPlayEnd', (job, done) => {
    roomModeWaitlistAPI.endPlay(job.attrs.data.roomId).then(() => done());
  });

  agenda.start();

  broker.createService({
    name: "connection",
    actions: {
      join(ctx) {
        const { connectionId, instanceId } = ctx.params;
        console.log('join', connectionId, instanceId);
        connectionEventsAPI.onJoin(connectionId, instanceId);
      },
      leave(ctx) {
        const { connectionId } = ctx.params;
        connectionEventsAPI.onLeave(connectionId);
        console.log('leave', connectionId);
      },
      login(ctx) {
        const { connectionId, userId } = ctx.params;
        connectionEventsAPI.onLogin(connectionId, userId);
        console.log('login', connectionId, userId);
      },
      clearInstance(ctx) {
        const { instanceId } = ctx.params;
        connectionAPI.removeInstanceConnections(instanceId);
        console.log('clear', instanceId);
      },
      joinRoom(ctx) {
        const { connectionId, roomId } = ctx.params;
        roomEventsAPI.onJoin(roomId, connectionId);
        console.log('join room', connectionId, roomId);
      },
      leaveRoom(ctx) {
        const { connectionId, roomId } = ctx.params;
        roomEventsAPI.onLeave(roomId, connectionId);
        console.log('leave room', connectionId, roomId);
      }
    }
  });

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
          console.log(instanceName, 'down');
          redis.hdel('ihc', instanceName);          
        });
      }
    });
  }, 5000);

  broker.createService({
    name: "wsapi",
    events: {
      "wsapi.publish"(ctx) {
        const { eventName, payload, filterData } = ctx;
        wsAPI.send(eventName, payload, (cdata) => objFilter(cdata, filterData));
      }
    }
  });

}