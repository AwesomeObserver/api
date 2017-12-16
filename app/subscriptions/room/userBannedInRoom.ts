import { withFilter } from 'graphql-subscriptions';

import { PubSub } from 'core/pubsub';

export const schema = `
  userBannedInRoom(roomId: Int!): Int
`;

export const resolver = {
  subscribe: withFilter(
    () => PubSub.asyncIterator('userBannedInRoom'),
    (payload, vars) => payload.roomId === vars.roomId
  )
};