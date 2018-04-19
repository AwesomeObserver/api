import { actions as allActions } from '../../app/access/actions';
import { roles as allRoles } from '../../app/access/roles';
import { Access } from './Access';

export const access = new Access(allActions, allRoles);

test('some', () => {
	console.log(access.getRole('manager'));
});
