import { withFilter } from 'graphql-subscriptions';

import { PubSub } from 'core/pubsub';

export const schema = `
  userBannedInRoom(roomId: String!): UserRoomBanData
`;

export const resolver = () => ({
  subscribe: withFilter(() => PubSub.asyncIterator('userBannedInRoom'), (payload, variables) => {
    return payload.roomId === variables.roomId;
  })
});