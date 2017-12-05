// import { checkAccess } from 'access';
// import { getUserWithRoom } from 'api/room/user';
// import { removeAllMessagesInRoom } from 'api/room/chat';

export const schema = `
  clearChat(roomId: String!): Boolean
`;

async function access(
  args: {
    roomId: string
  },
  ctx: any
) {
  // const current = await getUserWithRoom(connectionData.userId, vars.roomId);
  
  // checkAccess({ group: 'room', name: 'clearChat' }, current);
}

export async function resolver(
  root: any,
  args: {
    roomId: string
  },
  ctx: any
) {
  // const { roomId } = vars;
  // const { userId } = connectionData;

  // await access(vars, connectionData);

  // return removeAllMessagesInRoom(roomId);
  const payload = {
    chatMessagesDeleted: true,
    roomId: args.roomId
  };

  ctx.GG.pubsub.publish('chatMessagesDeleted', payload);

  return true;
}