import { withFilter } from 'graphql-subscriptions';

export const schema = `
  chatMessagesUserDeleted(roomId: String!): String
`;

export const resolver = ({ pubsub }) => ({
  subscribe: withFilter(() => pubsub.asyncIterator('chatMessagesUserDeleted'), (payload, variables) => {
    return payload.roomId === variables.roomId;
  })
});