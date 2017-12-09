import { withFilter } from 'graphql-subscriptions';

import { PubSub } from 'core/pubsub';

export const schema = `
  chatMessageAdded(roomId: Int!): ChatMessage
`;

export const resolver = {
  subscribe: withFilter(
    () => PubSub.asyncIterator('chatMessageAdded'),
    (payload, vars) => payload.roomId === vars.roomId
  )
};