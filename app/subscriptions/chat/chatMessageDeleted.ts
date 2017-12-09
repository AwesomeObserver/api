import { withFilter } from 'graphql-subscriptions';

import { PubSub } from 'core/pubsub';

export const schema = `
  chatMessageDeleted(roomId: String!): String
`;

export const resolver = () => ({
  subscribe: withFilter(() => PubSub.asyncIterator('chatMessageDeleted'), (payload, variables) => {
    return payload.roomId === variables.roomId;
  })
});