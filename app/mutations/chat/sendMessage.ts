import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import * as addSeconds from 'date-fns/add_seconds';
import * as isBefore from 'date-fns/is_before';

import { PubSub } from 'core/pubsub';
import { Access } from 'app/api/Access';
import { ActionTime } from 'app/api/ActionTime';
import { Connection } from 'app/api/connection/Connection';
import { Room } from 'app/api/room/Room';
import { RoomUser } from 'app/api/room/RoomUser';

const { CHAT_SECRET } = process.env;

export const schema = `
  sendMessage(roomId: String!, message: String!): Boolean
`;

export async function access(args, ctx, current) {
  const room = await Room.getOnePure({ id: args.roomId });
  const userId = current.site.id;
  const roomId = args.roomId;

  await Access.check({
    group: 'room',
    name: 'sendMessage'
  }, current);

  // Slow Mode
  if (room.slowMode) {
    try {
      Access.check({
        group: 'room',
        name: 'sendMessageSlowModeIgnore'
      }, current);
    } catch (error) {
      
      const actionName = `sendMessage:${roomId}`;
      const lastMessageDate = await ActionTime.get(userId, actionName);
      
      const sendMessageDelay = 2;

      if (isBefore(+new Date(), addSeconds(lastMessageDate, sendMessageDelay))) {
        throw new Error('denyForSlowMode');
      }
    } 
  }

  // Follower Mode
  if (room.followerMode) {
    try {
      Access.check({
        group: 'room',
        name: 'sendMessageFollowerModeIgnore'
      }, current);
    } catch (error) {
      const { follower, lastFollowDate } = current.room;

      if (!follower) {
        throw new Error('mustBeFollow');
      }
  
      if (!isBefore(addSeconds(lastFollowDate, 60 * 30), +new Date())) {
        throw new Error('denyForFollowMode');
      }
    } 
  }
}

export async function resolver(
  root: any,
  args: {
    roomId: string,
    message: string
  },
  ctx: any
) {
  const { roomId, message } = args;

  const userId = await Connection.getUserId(ctx.connectionId);
  const user = await RoomUser.getOneFull(userId, args.roomId);

  await access(args, ctx, user);

  ActionTime.set(userId, `sendMessage:${roomId}`);
  
  const messageId = crypto.randomBytes(10).toString('hex');
  
  await PubSub.publish('chatMessageAdded', {
    chatMessageAdded: {
      id: messageId,
      user,
      text: message,
      authorSign: jwt.sign({ userId: user.site.id, messageId }, CHAT_SECRET)
    },
    roomId
  });

  return true;
}