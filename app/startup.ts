import { Agenda } from 'core/db';
import { RoomWaitlistQueue } from 'app/api/room/RoomWaitlistQueue';
import { RoomUserWaitlistQueue } from 'app/api/room/RoomUserWaitlistQueue';

export default async () => {
  console.log(`API Server is ready`);

  await RoomUserWaitlistQueue.add(1, 1, 1);
  await RoomUserWaitlistQueue.add(1, 1, 2);

  Agenda.define('waitlistPlayEnd', (job, done) => {
    RoomWaitlistQueue.endPlay(job.attrs.data.roomId).then(() => done());
  });

  Agenda.start();
}