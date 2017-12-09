import { withFilter } from 'graphql-subscriptions';

export const schema = `
  chatMessagesDeleted(roomId: String!): Boolean
`;

export const resolver = ({ pubsub }) => ({
  subscribe: withFilter(() => pubsub.asyncIterator('chatMessagesDeleted'), (payload, variables) => {
    return payload.roomId === variables.roomId;
  })
});