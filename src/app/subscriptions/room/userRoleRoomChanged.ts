import { withFilter } from 'graphql-subscriptions';

export const schema = `
  userRoleRoomChanged(roomId: String!): UserRoomRoleData
`;

export const resolver = ({ pubsub }) => ({
  subscribe: withFilter(() => pubsub.asyncIterator('userRoleRoomChanged'), (payload, variables) => {
    return payload.roomId === variables.roomId;
  })
});