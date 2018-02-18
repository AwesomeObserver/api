export const accessRoles = [
  {
    name: 'guest',
    actions: [
      'login'
    ]
  },
  {
    name: 'user',
    actions: [
      'logout',
      'manageMessage',
      'replyMessage',
      'sendMessage',
      'follow',
      'unfollow',
      'waitlistAdd',
      'waitlistAddSource',
      'waitlistMoveSource',
      'waitlistRemoveSource',
      'modeWaitlistOpenMyPlaylist'
    ]
  },
  {
    name: 'mod',
    extend: 'user',
    actions: [
      'manageRoom',
      'removeMessage',
      'removeAllMessages',
      'changeFollowerMode',
      'changeSlowMode',
      'sendMessageSlowModeIgnore',
      'sendMessageFollowerModeIgnore',
      'waitlistMoveUser',
      'waitlistRemoveUser'
    ]
  },
  {
    name: 'manager',
    extend: 'mod',
    actions: [
      'manageRoom',
      'setRoomTitle',
      'setRoleRoom',
      'setRoleRoomMod',
      'setRoleRoomUser'
    ]
  },
  {
    name: 'owner',
    extend: 'user',
    groups: ['room']
  },
  {
    name: 'admin',
    groups: ['global', 'room']
  },
  {
    name: 'founder',
    groups: ['global', 'room']
  }
];