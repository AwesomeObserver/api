export const accessActions = {
  createRoom: {},
  removeRoom: {},
  banRoom: {},
  unbanRoom: {},
  profileMenu: {},
  banUser: {
    context: true
  },
  setRole: {
    context: true
  },
  setRoleUser: {
    context: true
  },
  setRoleAdmin: {
    context: true
  },
  waitlistAddSource: {},
  waitlistMoveSource: {},
  waitlistRemoveSource: {},
  setRoomTitle: {
    groups: ['room']
  },
  manageRoom: {
    groups: ['room']
  },
  follow: {
    groups: ['room']
  },
  unfollow: {
    groups: ['room']
  },
  // User
  banUserRoom: {
    groups: ['room'],
    context: true
  },
  unbanUserRoom: {
    groups: ['room']
  },
  setRoleRoom: {
    groups: ['room'],
    context: true
  },
  setRoleRoomManager: {
    groups: ['room'],
    context: true
  },
  setRoleRoomMod: {
    groups: ['room'],
    context: true
  },
  setRoleRoomUser: {
    groups: ['room'],
    context: true
  },
  getRoomBans: {
    groups: ['room']
  },
  chatMenu: {
    groups: ['room']
  },
  manageMessage: {
    groups: ['room']
  },
  sendMessage: {
    groups: ['room']
  },
  replyMessage: {
    groups: ['room']
  },
  removeMessage: {
    groups: ['room']
  },
  sendMessageSlowModeIgnore: {
    groups: ['room']
  },
  sendMessageFollowerModeIgnore: {
    groups: ['room']
  },
  removeAllMessages: {
    groups: ['room']
  },
  changeFollowerMode: {
    groups: ['room']
  },
  changeSlowMode: {
    groups: ['room']
  },
  waitlistAdd: {
    groups: ['room']
  },
  waitlistMoveUser: {
    groups: ['room']
  },
  waitlistRemoveUser: {
    groups: ['room']
  },
  modeWaitlistOpenMyPlaylist: {
    groups: ['room']
  },
  waitlistMenu: {
    groups: ['room']
  },
  waitlistSkip: {
    groups: ['room']
  },
  waitlistKick: {
    groups: ['room']
  },
  waitlistClear: {
    groups: ['room']
  },
  collectionAddSource: {
    groups: ['room']
  },
  collectionRemoveSource: {
    groups: ['room']
  },
  collectionStart: {
    groups: ['room']
  }
};