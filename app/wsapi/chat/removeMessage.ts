import { pubSub } from 'core/pubsub';
import { accessAPI, actionTimeAPI, roomUserAPI } from 'app/api';

async function access(roomId: number, current) {
  const userId = current.site.id;

  await accessAPI.check({
    group: 'room',
    name: 'removeMessage'
  }, current);
}

export async function removeMessage(messageId: string, cdata) {
  const { roomId, userId } = cdata;

  if (!roomId) {
    throw new Error('Outside room');
  }

  const user = await roomUserAPI.getOneFull(userId, roomId);

  await access(roomId, user);

  pubSub.publish('removeMessage', messageId, { roomId });
}