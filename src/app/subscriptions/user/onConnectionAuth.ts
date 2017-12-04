import { withFilter } from 'graphql-subscriptions';

export const schema = `
  onConnectionAuth(connectionKey: String!): String
`;

export const resolver = ({ pubsub }) => ({
  subscribe: withFilter(() => pubsub.asyncIterator('onConnectionAuth'), (payload, variables) => {
    return payload.connectionKey === variables.connectionKey;
  })
});