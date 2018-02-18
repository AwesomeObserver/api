import { pubSub } from 'core/pubsub';
import { accessAPI, actionTimeAPI, roomUserAPI } from 'app/api';

export const schema = `
  removeRoomMessage(
    roomId: Int!,
    messageId: String!
  ): Boolean
`;

async function access(roomId: number, current) {
  const userId = current.site.id;

  await accessAPI.check('removeMessage', current);
}

export async function resolver(
  root: any,
  args: {
		roomId: number,
		messageId: string
  },
	ctx: any
) {
  const { roomId, messageId } = args;
  const { userId } = ctx;

  if (!roomId) {
    throw new Error('Outside room');
  }

  const user = await roomUserAPI.getOneFull(userId, roomId);

  await access(roomId, user);

  pubSub.publish('removeMessage', messageId, { roomId });
}