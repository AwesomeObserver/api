import { uniq } from 'core/utils';
import { Access } from './lib/Access';
import { actions as allActions } from 'app/access/actions';
import { roles as allRoles } from 'app/access/roles';

export const access = new Access(allActions, allRoles);

// const checkAccessByActionData = (actionData, current, context) => {
// 	if (!actionData.context) return true;
// 	if (actionData.self && current.id == context.id) return true;
// 	if (!actionData.self && current.id == context.id) return false;

// 	if (actionData.hierarchy) {
// 		const currentWeight = getRolesWeight(current.roles);
// 		const contextWeight = getRolesWeight(context.roles);

// 		if (currentWeight <= contextWeight) {
// 			return false;
// 		}
// 	}

// 	return true;
// };

export const checkAccess = (action, current, context) => {
	const actionData = access.getAction(action);

	if (!actionData) {
		throw new Error(`Action ${action} not found`);
	}

	if (!access.isAllowByRoles(current.roles, action)) {
		return false;
	}

	// if (!checkAccessByActionData(actionData, current, context)) {
	// 	return false;
	// }

	return true;
};

const userDataFormatHack = (user) => {
	if (user.room) {
		return Object.assign({}, user, {
			id: user.site.id,
			roles: uniq([user.site.role, user.room.role]),
			banned: user.site.banned || user.room.banned
		});
	}

	return Object.assign({}, user, {
		roles: [user.role],
		banned: user.banned
	});
};

export const accessCheck = (action: string, current, context?) => {
	if (current) {
		current = userDataFormatHack(current);
	} else {
		current = {
			id: 0,
			roles: ['guest'],
			banned: false
		};
	}

	if (context) {
		context = userDataFormatHack(context);
	}

	if (!checkAccess(action, current, context)) {
		throw new Error('Deny');
	}

	return true;
};
