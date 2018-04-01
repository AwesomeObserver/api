export const actions = [
	{
		name: 'createRoom'
		// groups: ['global']
	},
	{
		name: 'removeRoom'
		// groups: ['global']
	},
	{
		name: 'banUser'
		// groups: ['global']
	},
	{
		name: 'follow',
		groups: ['room'] // groups: ['global', 'room']
	},
	{
		name: 'banUserRoom',
		groups: ['room'], // groups: ['global', 'room']
		context: true
	}
];

export const roles = [
	{
		name: 'guest',
		actions: []
	},
	{
		name: 'user',
		actions: ['follow']
	},
	{
		name: 'mod',
		extend: 'user',
		actions: ['banUserRoom']
	},
	{
		name: 'admin',
		groups: ['global']
	}
];
