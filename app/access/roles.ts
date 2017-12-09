// Гость
export const guest = {
  rules: {
    global: {
      actions: {
        login: true,
      }
    }
  }
};

// Пользователь
export const user = {
  rules: {
    global: {
      actions: {
        logout: true
      }
    },
    room: {
      actions: {
        manageMessage: true,
        replyMessage: true,
        sendMessage: true,
        follow: true,
        unfollow: true
      }
    }
  }
};

// Владелец сервиса
export const founder = {
  extend: 'user',
  rules: {
    global: {
      ignore: true
    },
    room: {
      ignore: true
    }
  }
};

export const admin = {
  extend: 'user',
  rules: {
    global: {
      ignore: true
    },
    room: {
      ignore: true
    }
  }
};

// Владелец комнаты
export const owner = {
  extend: 'user',
  rules: {
    room: {
      ignore: true
    }
  }
};

export const mod = {
  extend: 'user',
  rules: {
    room: {
      actions: {
        manageRoom: true,
        removeMessage: true,
        removeAllMessages: true,
        changeFollowerMode: true,
        changeSlowMode: true,
        sendMessageSlowModeIgnore: true,
        sendMessageFollowerModeIgnore: true
      }
    }
  }
}

export const manager = {
  extend: 'mod',
  rules: {
    room: {
      actions: {
        manageRoom: true,
        setRoleRoom: true,
        setRoleRoomMod: true,
        setRoleRoomUser: true
      }
    }
  }
};