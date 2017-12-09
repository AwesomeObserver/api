import { withFilter } from 'graphql-subscriptions';

import { PubSub } from 'core/pubsub';

export const schema = `
  chatMessagesDeleted(roomId: Int!): Boolean
`;

export const resolver = {
  subscribe: withFilter(
    () => PubSub.asyncIterator('chatMessagesDeleted'),
    (payload, vars) => payload.roomId === vars.roomId
  )
};