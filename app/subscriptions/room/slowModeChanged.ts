import { withFilter } from 'graphql-subscriptions';

import { PubSub } from 'core/pubsub';

export const schema = `
  slowModeChanged(roomId: Int!): Boolean
`;

export const resolver = {
  subscribe: withFilter(
    () => PubSub.asyncIterator('slowModeChanged'),
    (payload, vars) => payload.roomId === vars.roomId
  )
};