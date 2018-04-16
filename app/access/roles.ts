export const roles = [
	{
		name: 'guest',
		allows: []
	},
	{
		name: 'user',
		allows: [
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
		allows: [
			'manageRoom',
			'removeMessage',
			'removeAllMessages',
			'changeFollowerMode',
			'changeSlowMode',
			'sendMessageSlowModeIgnore',
			'sendMessageFollowerModeIgnore',
			'waitlistMoveUser',
			'waitlistRemoveUser',
			'waitlistMenu',
			'waitlistSkip',
			'waitlistKick',
			'waitlistClear',
			'collectionAddSource',
			'collectionRemoveSource',
			'collectionStart',
			'waitlistLock',
			'waitlistLockIgnore'
		]
	},
	{
		name: 'manager',
		extend: 'mod',
		allows: [
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
