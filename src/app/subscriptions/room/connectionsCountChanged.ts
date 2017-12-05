import { withFilter } from 'graphql-subscriptions';

export const schema = `
  connectionsCountChanged(roomId: String!): ConnectionsCounts
`;

export const resolver = ({ pubsub }) => ({
  subscribe: withFilter(() => pubsub.asyncIterator('connectionsCountChanged'), (payload, variables) => {
    return payload.roomId === variables.roomId;
  })
});