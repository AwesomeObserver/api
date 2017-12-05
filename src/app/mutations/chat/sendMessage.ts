import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

const { CHAT_SECRET } = process.env;

export const schema = `
  sendMessage(roomId: String!, message: String!): Boolean
`;

export async function resolver(root, args, ctx) {
  
  console.log(ctx);

  const user = {
    site: {
      id: '1',
      name: 'Sygeman',
      avatar: 'https://pp.userapi.com/c638225/v638225510/26a4/MEvCIFtSVxc.jpg',
      role: 'founder'
    },
    room: {
      role: 'user'
    }
  };

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