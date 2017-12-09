import { withFilter } from 'graphql-subscriptions';

import { PubSub } from 'core/pubsub';

export const schema = `
  chatMessageAdded(roomId: String!): ChatMessage
`;

export const resolver = () => ({
  subscribe: withFilter(() => PubSub.asyncIterator('chatMessageAdded'), (payload, variables) => {
    return payload.roomId === variables.roomId;
  })
});