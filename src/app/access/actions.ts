export const global = {
  // Room
  createRoom: {},
  removeRoom: {},
  banRoom: {},
  unbanRoom: {},
  // User
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
};

export const room = {
  manageRoom: {},
  // User
  banUserRoom: {
    context: true
  },
  unbanUserRoom: {},
  setRoleRoom: {
    context: true
  },
  setRoleRoomManager: {
    context: true
  },
  setRoleRoomMod: {
    context: true
  },
  setRoleRoomUser: {
    context: true
  },
  getRoomBans: {},
  // Chat
  chatMenu: {},
  manageMessage: {},
  sendMessage: {},
  replyMessage: {},
  removeMessage: {
    context: true,
    self: true
  },
  sendMessageSlowModeIgnore: {},
  sendMessageFollowerModeIgnore: {},
  removeAllMessages: {},
  changeFollowerMode: {},
  changeSlowMode: {},
  follow: {},
  unfollow: {}
};