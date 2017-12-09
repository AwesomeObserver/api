import { withFilter } from 'graphql-subscriptions';

import { PubSub } from 'core/pubsub';

export const schema = `
  chatMessagesUserDeleted(roomId: String!): String
`;

export const resolver = () => ({
  subscribe: withFilter(() => PubSub.asyncIterator('chatMessagesUserDeleted'), (payload, variables) => {
    return payload.roomId === variables.roomId;
  })
});