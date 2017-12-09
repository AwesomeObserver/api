import { withFilter } from 'graphql-subscriptions';

import { PubSub } from 'core/pubsub';

export const schema = `
  chatMessagesUserDeleted(roomId: Int!): String
`;

export const resolver = {
  subscribe: withFilter(
    () => PubSub.asyncIterator('chatMessagesUserDeleted'),
    (payload, vars) => payload.roomId === vars.roomId
  )
};