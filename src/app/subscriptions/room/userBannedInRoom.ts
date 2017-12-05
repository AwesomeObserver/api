import { withFilter } from 'graphql-subscriptions';

export const schema = `
  userBannedInRoom(roomId: String!): UserRoomBanData
`;

export const resolver = ({ pubsub }) => ({
  subscribe: withFilter(() => pubsub.asyncIterator('userBannedInRoom'), (payload, variables) => {
    return payload.roomId === variables.roomId;
  })
});