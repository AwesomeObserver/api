import { withFilter } from 'graphql-subscriptions';

import { PubSub } from 'core/pubsub';

export const schema = `
  onConnectionAuth(connectionKey: String!): String
`;

export const resolver = () => ({
  subscribe: withFilter(() => PubSub.asyncIterator('onConnectionAuth'), (payload, variables) => {
    return payload.connectionKey === variables.connectionKey;
  })
});