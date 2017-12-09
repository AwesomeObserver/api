import { withFilter } from 'graphql-subscriptions';

export const schema = `
  slowModeChanged(roomId: String!): Boolean
`;

export const resolver = ({ pubsub }) => ({
  subscribe: withFilter(() => pubsub.asyncIterator('slowModeChanged'), (payload, variables) => {
    return payload.roomId === variables.roomId;
  })
});