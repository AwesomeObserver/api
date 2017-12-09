import { withFilter } from 'graphql-subscriptions';

export const schema = `
  chatMessageAdded(roomId: String!): ChatMessage
`;

export const resolver = ({ pubsub }) => ({
  subscribe: withFilter(() => pubsub.asyncIterator('chatMessageAdded'), (payload, variables) => {
    return payload.roomId === variables.roomId;
  })
});