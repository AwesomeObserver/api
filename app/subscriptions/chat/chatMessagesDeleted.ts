import { withFilter } from 'graphql-subscriptions';

import { PubSub } from 'core/pubsub';

export const schema = `
  chatMessagesDeleted(roomId: String!): Boolean
`;

export const resolver = () => ({
  subscribe: withFilter(() => PubSub.asyncIterator('chatMessagesDeleted'), (payload, variables) => {
    return payload.roomId === variables.roomId;
  })
});