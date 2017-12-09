import { withFilter } from 'graphql-subscriptions';

export const schema = `
  chatMessageDeleted(roomId: String!): String
`;

export const resolver = ({ pubsub }) => ({
  subscribe: withFilter(() => pubsub.asyncIterator('chatMessageDeleted'), (payload, variables) => {
    return payload.roomId === variables.roomId;
  })
});