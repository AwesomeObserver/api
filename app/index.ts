import { agenda } from 'core/db';
import { roomModeWaitlistAPI } from 'app/api';

export async function startup() {
  console.log(`API Server is ready`);

  agenda.define('waitlistPlayEnd', (job, done) => {
    roomModeWaitlistAPI.endPlay(job.attrs.data.roomId).then(() => done());
  });

  agenda.start();
}