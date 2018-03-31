const { objFilter } = require('./utils');

test('objFilter pass', () => {
	expect(objFilter({ a: 1, b: 2 }, { a: 1 })).toBeTruthy();
});

test('objFilter not pass', () => {
	expect(objFilter({ a: 1, b: 2 }, { a: 2 })).toBeFalsy();
});
