export const actions = [
	{
		name: 'login'
	},
	{
		name: 'logout',
		groups: ['global']
	},
	{
		name: 'createRoom',
		groups: ['global']
	},
	{
		name: 'removeRoom',
		groups: ['global']
	},
	{
		name: 'banRoom',
		groups: ['global']
	},
	{
		name: 'unbanRoom',
		groups: ['global']
	},
	{
		name: 'profileMenu',
		groups: ['global']
	},
	{
		name: 'banUser',
		groups: ['global'],
		context: true
	},
	{
		name: 'setRole',
		groups: ['global'],
		context: true
	},
	{
		name: 'setRoleUser',
		groups: ['global'],
		context: true
	},
	{
		name: 'setRoleAdmin',
		groups: ['global'],
		context: true
	},
	{
		name: 'waitlistAddSource',
		groups: ['global']
	},
	{
		name: 'waitlistMoveSource',
		groups: ['global']
	},
	{
		name: 'waitlistRemoveSource',
		groups: ['global']
	},
	{
		name: 'setRoomTitle',
		groups: ['global', 'room']
	},
	{
		name: 'manageRoom',
		groups: ['global', 'room']
	},
	{
		name: 'follow',
		groups: ['global', 'room']
	},
	{
		name: 'unfollow',
		groups: ['global', 'room']
	},
	// User
	{
		name: 'banUserRoom',
		groups: ['global', 'room'],
		context: true
	},
	{
		name: 'unbanUserRoom',
		groups: ['global', 'room']
	},
	{
		name: 'setRoleRoom',
		groups: ['global', 'room'],
		context: true
	},
	{
		name: 'setRoleRoomManager',
		groups: ['global', 'room'],
		context: true
	},
	{
		name: 'setRoleRoomMod',
		groups: ['global', 'room'],
		context: true
	},
	{
		name: 'setRoleRoomUser',
		groups: ['global', 'room'],
		context: true
	},
	{
		name: 'getRoomBans',
		groups: ['global', 'room']
	},
	{
		name: 'chatMenu',
		groups: ['global', 'room']
	},
	{
		name: 'manageMessage',
		groups: ['global', 'room']
	},
	{
		name: 'sendMessage',
		groups: ['global', 'room']
	},
	{
		name: 'replyMessage',
		groups: ['global', 'room']
	},
	{
		name: 'removeMessage',
		groups: ['global', 'room']
	},
	{
		name: 'sendMessageSlowModeIgnore',
		groups: ['global', 'room']
	},
	{
		name: 'sendMessageFollowerModeIgnore',
		groups: ['global', 'room']
	},
	{
		name: 'removeAllMessages',
		groups: ['global', 'room']
	},
	{
		name: 'changeFollowerMode',
		groups: ['global', 'room']
	},
	{
		name: 'changeSlowMode',
		groups: ['global', 'room']
	},
	{
		name: 'waitlistAdd',
		groups: ['global', 'room']
	},
	{
		name: 'waitlistMoveUser',
		groups: ['global', 'room']
	},
	{
		name: 'waitlistRemoveUser',
		groups: ['global', 'room']
	},
	{
		name: 'modeWaitlistOpenMyPlaylist',
		groups: ['global', 'room']
	},
	{
		name: 'waitlistMenu',
		groups: ['global', 'room']
	},
	{
		name: 'waitlistSkip',
		groups: ['global', 'room']
	},
	{
		name: 'waitlistKick',
		groups: ['global', 'room']
	},
	{
		name: 'waitlistClear',
		groups: ['global', 'room']
	},
	{
		name: 'collectionAddSource',
		groups: ['global', 'room']
	},
	{
		name: 'collectionRemoveSource',
		groups: ['global', 'room']
	},
	{
		name: 'collectionStart',
		groups: ['global', 'room']
	},
	{
		name: 'waitlistLock',
		groups: ['global', 'room']
	},
	{
		name: 'waitlistLockIgnore',
		groups: ['global', 'room']
	}
];
