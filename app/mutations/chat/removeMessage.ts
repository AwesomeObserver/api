import * as jwt from 'jsonwebtoken';

const { CHAT_SECRET } = process.env;

export const schema = `
  removeMessage(
    roomId: String!,
    messageId: String!,
    authorSign: String!
  ): Boolean
`;

async function access(
  args: {
    roomId: string,
    messageId: string,
    authorSign: string
  },
  ctx: any
) {
  const checkAccess = ctx.GG.API.Access.checkAccess;
  const getOneFull = ctx.GG.API.RoomUser.getOneFull;
  const getUserId = ctx.GG.API.Connection.getUserId;
  
  const { userId, messageId } = jwt.verify(args.authorSign, CHAT_SECRET);

  if (args.messageId != messageId) {
    throw new Error('NotBad');
  }

  const currentUserId = await getUserId(ctx.connectionId);
  
  const [current, context] = await Promise.all([
    getOneFull(currentUserId, args.roomId),
    getOneFull(userId, args.roomId)
  ]);
  
  checkAccess({
    group: 'room',
    name: 'removeMessage'
  }, current, context);
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
  await access(args, ctx);

  await ctx.GG.pubsub.publish('chatMessageDeleted', {
    chatMessageDeleted: args.messageId,
    roomId: args.roomId
  });

  return true;
}