import { withFilter } from 'graphql-subscriptions';

import { PubSub } from 'core/pubsub';

export const schema = `
  userRoleRoomChanged(roomId: String!): UserRoomRoleData
`;

export const resolver = () => ({
  subscribe: withFilter(() => PubSub.asyncIterator('userRoleRoomChanged'), (payload, variables) => {
    return payload.roomId === variables.roomId;
  })
});