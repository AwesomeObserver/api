const { objFilter } = require('../core/utils');

test('objFilter 1', () => {
  expect(objFilter({ a: 1, b: 2 }, { a: 1 })).toBeTruthy();
});

test('objFilter 2', () => {
  expect(objFilter({ a: 1, b: 2 }, { a: 2 })).toBeFalsy();
});