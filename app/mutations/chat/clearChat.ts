import { PubSub } from 'core/pubsub';
import { Access } from 'app/api/Access';
import { Connection } from 'app/api/connection/Connection';
import { RoomUser } from 'app/api/room/RoomUser';

export const schema = `
  clearChat(roomId: Int!): Boolean
`;

async function access(roomId: number, userId: number) {
  const current = await RoomUser.getOneFull(userId, roomId);
  
  await Access.check({
    group: 'room',
    name: 'clearChat'
  }, current);
}

export async function resolver(
  root: any,
  args: {
    roomId: number
  },
  ctx: any
) {
  const { roomId } = args;
  const userId = ctx.userId;

  await access(roomId, userId);

  PubSub.publish('chatMessagesDeleted', {
    chatMessagesDeleted: true,
    roomId
  });

  return true;
}