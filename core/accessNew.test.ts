const { access } = require('./accessNew');

test('makeMask 1 role', () => {
	expect(access.makeMask('admin')).toBe(0);
});

test('getGroupActions', () => {
	console.log(access.getGroupActions('global'));
	// expect(access.getGroupActions('room')).toBe(0);
});
