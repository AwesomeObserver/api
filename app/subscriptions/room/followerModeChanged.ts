import { withFilter } from 'graphql-subscriptions';

export const schema = `
  followerModeChanged(roomId: String!): Boolean
`;

export const resolver = ({ pubsub }) => ({
  subscribe: withFilter(() => pubsub.asyncIterator('followerModeChanged'), (payload, variables) => {
    return payload.roomId === variables.roomId;
  })
});