import { withFilter } from 'graphql-subscriptions';

import { PubSub } from 'core/pubsub';

export const schema = `
  connectionsCountChanged(roomId: String!): ConnectionsCounts
`;

export const resolver = () => ({
  subscribe: withFilter(() => PubSub.asyncIterator('connectionsCountChanged'), (payload, variables) => {
    return payload.roomId === variables.roomId;
  })
});