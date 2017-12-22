// import { Redis } from 'core/db';
import { RoomWaitlistQueue } from 'app/api/room/RoomWaitlistQueue';

export default async () => {
  // Redis.flushall();
  console.log(`API Server is ready`);

  // console.log(await RoomWaitlistQueue.get(3));

  await RoomWaitlistQueue.clear(3);

  await RoomWaitlistQueue.set(3, 4);

//   console.log(await RoomWaitlistQueue.get(3));

//   await RoomWaitlistQueue.add(3, 1);
//   await RoomWaitlistQueue.add(3, 2);
//   await RoomWaitlistQueue.add(3, 3);
//   await RoomWaitlistQueue.add(3, 4);

//  console.log(await RoomWaitlistQueue.get(3));
  
//  await RoomWaitlistQueue.move(3, 0, 3);
  
//  console.log(await RoomWaitlistQueue.get(3));
}