import { withFilter } from 'graphql-subscriptions';

import { PubSub } from 'core/pubsub';

export const schema = `
  followerModeChanged(roomId: String!): Boolean
`;

export const resolver = () => ({
  subscribe: withFilter(() => PubSub.asyncIterator('followerModeChanged'), (payload, variables) => {
    return payload.roomId === variables.roomId;
  })
});