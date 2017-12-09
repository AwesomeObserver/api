import * as jwt from 'jsonwebtoken';

import { PubSub } from 'core/pubsub';
import { Access } from 'app/api/Access';
import { RoomUser } from 'app/api/room/RoomUser';
import { Connection } from 'app/api/connection/Connection';

const { CHAT_SECRET } = process.env;

export const schema = `
  removeMessage(
    roomId: String!,
    messageId: String!,
    authorSign: String!
  ): Boolean
`;

async function access(
  args: {
    roomId: number,
    messageId: string,
    authorSign: string
  },
  ctx: any
) {
  
  const { userId, messageId } = jwt.verify(args.authorSign, CHAT_SECRET);

  if (args.messageId != messageId) {
    throw new Error('NotBad');
  }

  const currentUserId = await Connection.getUserId(ctx.connectionId);
  
  const [current, context] = await Promise.all([
    RoomUser.getOneFull(currentUserId, args.roomId),
    RoomUser.getOneFull(userId, args.roomId)
  ]);
  
  Access.check({
    group: 'room',
    name: 'removeMessage'
  }, current, context);
}

export async function resolver(
  root: any,
  args: {
    roomId: number,
    messageId: string,
    authorSign: string
  },
  ctx: any
) {
  await access(args, ctx);

  await PubSub.publish('chatMessageDeleted', {
    chatMessageDeleted: args.messageId,
    roomId: args.roomId
  });

  return true;
}