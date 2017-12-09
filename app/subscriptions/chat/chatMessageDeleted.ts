import { withFilter } from 'graphql-subscriptions';

import { PubSub } from 'core/pubsub';

export const schema = `
  chatMessageDeleted(roomId: Int!): String
`;

export const resolver = {
  subscribe: withFilter(
    () => PubSub.asyncIterator('chatMessageDeleted'),
    (payload, vars) => payload.roomId === vars.roomId
  )
};