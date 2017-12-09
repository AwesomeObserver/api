import { withFilter } from 'graphql-subscriptions';

import { PubSub } from 'core/pubsub';

export const schema = `
  userRoleRoomChanged(roomId: Int!): UserRoomRoleData
`;

export const resolver = {
  subscribe: withFilter(
    () => PubSub.asyncIterator('userRoleRoomChanged'),
    (payload, vars) => payload.roomId === vars.roomId
  )
};