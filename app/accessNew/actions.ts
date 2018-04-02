export const actions = [
	{
		name: 'createRoom'
	},
	{
		name: 'removeRoom'
	},
	{
		name: 'banRoom'
	},
	{
		name: 'unbanRoom'
	},
	{
		name: 'profileMenu'
	},
	{
		name: 'banUser',
		context: true
	},
	{
		name: 'setRole',
		context: true
	},
	{
		name: 'setRoleUser',
		context: true
	},
	{
		name: 'setRoleAdmin',
		context: true
	},
	{
		name: 'waitlistAddSource'
	},
	{
		name: 'waitlistMoveSource'
	},
	{
		name: 'waitlistRemoveSource'
	},
	{
		name: 'setRoomTitle',
		groups: ['room']
	},
	{
		name: 'manageRoom',
		groups: ['room']
	},
	{
		name: 'follow',
		groups: ['room']
	},
	{
		name: 'unfollow',
		groups: ['room']
	},
	// User
	{
		name: 'banUserRoom',
		groups: ['room'],
		context: true
	},
	{
		name: 'unbanUserRoom',
		groups: ['room']
	},
	{
		name: 'setRoleRoom',
		groups: ['room'],
		context: true
	},
	{
		name: 'setRoleRoomManager',
		groups: ['room'],
		context: true
	},
	{
		name: 'setRoleRoomMod',
		groups: ['room'],
		context: true
	},
	{
		name: 'setRoleRoomUser',
		groups: ['room'],
		context: true
	},
	{
		name: 'getRoomBans',
		groups: ['room']
	},
	{
		name: 'chatMenu',
		groups: ['room']
	},
	{
		name: 'manageMessage',
		groups: ['room']
	},
	{
		name: 'sendMessage',
		groups: ['room']
	},
	{
		name: 'replyMessage',
		groups: ['room']
	},
	{
		name: 'removeMessage',
		groups: ['room']
	},
	{
		name: 'sendMessageSlowModeIgnore',
		groups: ['room']
	},
	{
		name: 'sendMessageFollowerModeIgnore',
		groups: ['room']
	},
	{
		name: 'removeAllMessages',
		groups: ['room']
	},
	{
		name: 'changeFollowerMode',
		groups: ['room']
	},
	{
		name: 'changeSlowMode',
		groups: ['room']
	},
	{
		name: 'waitlistAdd',
		groups: ['room']
	},
	{
		name: 'waitlistMoveUser',
		groups: ['room']
	},
	{
		name: 'waitlistRemoveUser',
		groups: ['room']
	},
	{
		name: 'modeWaitlistOpenMyPlaylist',
		groups: ['room']
	},
	{
		name: 'waitlistMenu',
		groups: ['room']
	},
	{
		name: 'waitlistSkip',
		groups: ['room']
	},
	{
		name: 'waitlistKick',
		groups: ['room']
	},
	{
		name: 'waitlistClear',
		groups: ['room']
	},
	{
		name: 'collectionAddSource',
		groups: ['room']
	},
	{
		name: 'collectionRemoveSource',
		groups: ['room']
	},
	{
		name: 'collectionStart',
		groups: ['room']
	},
	{
		name: 'waitlistLock',
		groups: ['room']
	},
	{
		name: 'waitlistLockIgnore',
		groups: ['room']
	}
];
