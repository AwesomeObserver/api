import pubsub from '../../core/pubsub';

export const schema = `
  messageAdded: Message
`;

export const resolver = {
  subscribe: (published, args, ctx, info) => {
    return pubsub.asyncIterator(`messageAdded`);
  }
};