import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

const { CHAT_SECRET } = process.env;

export const schema = `
  sendMessage(roomId: String!, message: String!): Boolean
`;

export async function resolver(root, args, ctx) {

  const cData = await ctx.GG.API.Connection.getOne(ctx.connectionId);

  if (!cData) {
    throw new Error('UserOnly');
  }

  const user = await ctx.GG.API.RoomUser.getOneFull(cData.userId, args.roomId);

  if (!user) {
    throw new Error('UserOnly');
  }
  
  const messageId = crypto.randomBytes(10).toString('hex');

  const payload = {
    chatMessageAdded: {
      id: messageId,
      user,
      text: args.message,
      authorSign: jwt.sign({ userId: user.site.id, messageId }, CHAT_SECRET)
    },
    roomId: args.roomId
  };
  
  ctx.GG.pubsub.publish('chatMessageAdded', payload);
  return true;
}