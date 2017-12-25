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

async function access(roomId: number, current) {
  const userId = current.site.id;

  await Access.check({
    group: 'room',
    name: 'sendMessage'
  }, current);

  // const room = await Room.getOnePure({ id: roomId });

  // // Slow Mode
  // if (room.slowMode) {
  //   try {
  //     Access.check({
  //       group: 'room',
  //       name: 'sendMessageSlowModeIgnore'
  //     }, current);
  //   } catch (error) {
      
  //     const actionName = `sendMessage:${roomId}`;
  //     const lastMessageDate = await ActionTime.get(userId, actionName);
      
  //     const sendMessageDelay = 2;

  //     if (isBefore(+new Date(), addSeconds(lastMessageDate, sendMessageDelay))) {
  //       throw new Error('denyForSlowMode');
  //     }
  //   } 
  // }

  // // Follower Mode
  // if (room.followerMode) {
  //   try {
  //     Access.check({
  //       group: 'room',
  //       name: 'sendMessageFollowerModeIgnore'
  //     }, current);
  //   } catch (error) {
  //     const { follower, lastFollowDate } = current.room;

  //     if (!follower) {
  //       throw new Error('mustBeFollow');
  //     }
  
  //     if (!isBefore(addSeconds(lastFollowDate, 60 * 30), +new Date())) {
  //       throw new Error('denyForFollowMode');
  //     }
  //   } 
  // }
}

export async function chatMessage(message: string, cdata) {
  const { roomId, userId } = cdata;

  if (!roomId) {
    throw new Error('Outside room');
  }

  const user = await RoomUser.getOneFull(userId, roomId);

  await access(roomId, user);

  ActionTime.set(userId, `sendMessage:${roomId}`);
  
  const messageId = crypto.randomBytes(4).toString('hex');

  const userData = [
    [
      user.site.id,
      user.site.name,
      user.site.role,
      user.site.avatar
    ],
    [
      user.room.role
    ]
  ];

  const messageData = [messageId, userData, message];

  PubSub.publish('chatMessage', messageData, { roomId });
}