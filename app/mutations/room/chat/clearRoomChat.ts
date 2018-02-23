import { pubSub } from 'core/pubsub';
import { accessAPI, actionTimeAPI, roomUserAPI } from 'app/api';

export const schema = `
  clearRoomChat(roomId: Int!): Boolean
`;

async function access(roomId: number, current) {
  const userId = current.site.id;

  await accessAPI.check('removeAllMessages', current);
}

export async function resolver(
  root: any,
  args: {
		roomId: number
  },
  ctx: any
) {
  const { roomId } = args;
  const { userId } = ctx;

  if (!roomId) {
    throw new Error('Outside room');
  }

  const user = await roomUserAPI.getOneFull(userId, roomId);

  await access(roomId, user);
  
  pubSub.publish('clearChat', null, { roomId });
}