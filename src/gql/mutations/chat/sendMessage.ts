import * as crypto from 'crypto';

export const schema = `
  sendMessage(text: String!): Boolean
`;

export async function resolver(root, args, ctx) {
  const messageId = crypto.randomBytes(10).toString('hex');
  
  const payload = {
    messageAdded: {
      id: messageId,
      content: args.text,
    }
  };
  
  ctx.pubsub.publish('messageAdded', payload);
  return true;
}