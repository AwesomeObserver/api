import { withFilter } from 'graphql-subscriptions';

import { PubSub } from 'core/pubsub';

export const schema = `
  followerModeChanged(roomId: Int!): Boolean
`;

export const resolver = {
  subscribe: withFilter(
    () => PubSub.asyncIterator('followerModeChanged'),
    (payload, vars) => payload.roomId === vars.roomId
  )
};