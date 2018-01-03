import { agenda } from 'core/db';
import { logger } from 'core/logger';
import { roomModeWaitlistAPI } from 'app/api';

export async function startup() {
  logger.info(`API Server is ready`);

  agenda.define('waitlistPlayEnd', (job, done) => {
    roomModeWaitlistAPI.endPlay(job.attrs.data.roomId).then(() => done());
  });

  agenda.start();
}