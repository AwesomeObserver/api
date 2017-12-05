// import jwt from 'jsonwebtoken';
// import { checkAccess } from 'access';
// import { getUserWithRoom } from 'api/room/user';
// import { removeMessageFromChat } from 'api/room/chat';
// import type { ConnectionData } from 'types';
// const { CHAT_SECRET } = process.env;

export const schema = `
  removeMessage(
    roomId: String!,
    messageId: String!,
    authorSign: String!
  ): Boolean
`;

async function access(
  vars: {
    roomId: string,
    messageId: string,
    authorSign: string
  },
  ctx: any
) {
  // const { userId, messageId } = jwt.verify(vars.authorSign, CHAT_SECRET);

  // if (vars.messageId != messageId) {
  //   throw new Error('NotBad');
  // }

  // const [ current, context ] = await Promise.all([
  //   getUserWithRoom(connectionData.userId, vars.roomId),
  //   getUserWithRoom(userId, vars.roomId)
  // ]);
  
  // checkAccess({ group: 'room', name: 'removeMessage' }, current, context);
}

export async function resolver(
  root: any,
  args: {
    roomId: string,
    messageId: string,
    authorSign: string
  },
  ctx: any
) {
  // const { roomId, messageId } = vars;
  // const { userId } = connectionData;

  // await access(vars, connectionData);

  // return removeMessageFromChat(messageId, roomId);

  const payload = {
    chatMessageDeleted: args.messageId,
    roomId: args.roomId
  };

  ctx.GG.pubsub.publish('chatMessageDeleted', payload);

  return true;
}