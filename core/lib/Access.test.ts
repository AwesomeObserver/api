import { actions as allActions } from '../../app/accessNew/actions';
import { roles as allRoles } from '../../app/accessNew/roles';
import { Access } from './Access';

export const access = new Access(allActions, allRoles);

test('checkByPermission', () => {
	console.log(access.roles);
});