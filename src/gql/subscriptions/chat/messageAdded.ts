export const schema = `
  messageAdded: Message
`;

export const resolver = ({ pubsub }) => ({
  subscribe: () => {
    return pubsub.asyncIterator(`messageAdded`);
  }
});