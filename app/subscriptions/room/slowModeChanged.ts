import { withFilter } from 'graphql-subscriptions';

import { PubSub } from 'core/pubsub';

export const schema = `
  slowModeChanged(roomId: String!): Boolean
`;

export const resolver = () => ({
  subscribe: withFilter(() => PubSub.asyncIterator('slowModeChanged'), (payload, variables) => {
    return payload.roomId === variables.roomId;
  })
});