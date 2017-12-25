import { Agenda } from 'core/db';
import { RoomWaitlistQueue } from 'app/api/room/RoomWaitlistQueue';
import { RoomUserWaitlistQueue } from 'app/api/room/RoomUserWaitlistQueue';

export default async () => {
  console.log(`API Server is ready`);

  Agenda.define('waitlistPlayEnd', (job, done) => {
    RoomWaitlistQueue.endPlay(job.attrs.data.roomId).then(() => done());
  });

  Agenda.start();
}