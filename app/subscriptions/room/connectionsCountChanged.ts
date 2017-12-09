import { withFilter } from 'graphql-subscriptions';

import { PubSub } from 'core/pubsub';

export const schema = `
  connectionsCountChanged(roomId: Int!): ConnectionsCounts
`;

export const resolver = {
  subscribe: withFilter(
    () => PubSub.asyncIterator('connectionsCountChanged'),
    (payload, vars) =>  payload.roomId === vars.roomId
  )
};