import { merge, flip, union, uniq } from 'ramda';
import { accessActions } from 'app/access/actions';
import { accessRoles } from 'app/access/roles';

import { Access } from './lib/Access';
import { actions as allActions } from 'app/accessNew/actions';
import { roles as allRoles } from 'app/accessNew/roles';

export const access = new Access(allActions, allRoles);

const actionMask = {
	// Нужна ли инфа о пользователе в контексте
	context: false,
	// Cлабые роли не могут применить действие на более сильные
	hierarchy: true,
	// Можно ли применть действие к себе
	self: false
};

const makeActions = (actions) => {
	const res = {};

	Object.keys(actions).forEach((name) => {
		res[name] = flip(merge)(actions[name], actionMask);

		if (actions[name]['groups']) {
			res[name].groups = ['global', ...actions[name]['groups']];
		} else {
			res[name].groups = ['global'];
		}
	});

	return res;
};

const fullAccessActions = makeActions(accessActions);

const extendRole = (role) => {
	const pureExtRole = accessRoles.find((r) => r.name === role.extend);

	if (!pureExtRole) {
		throw new Error('Role for extend not found');
	}

	const extRole = pureExtRole.extend ? extendRole(pureExtRole) : pureExtRole;

	role.actions = union(role.actions, extRole.actions);
	role.groups = union(role.groups, extRole.groups);
	role.extend = undefined;

	return role;
};

const makeRoles = (roles) => {
	return roles.map((role) => {
		if (role.extend) {
			return extendRole(role);
		} else {
			role.actions = union(role.actions, []);
			role.groups = union(role.groups, []);
			return role;
		}
	});
};

// const getGroupsActions = (groups) => {
// 	return;
// };

// const extractGroups = (roles) => {
// 	return roles.map((role) => {
// 		return {
// 			...role,
// 			actions: union(role.actions, getGroupsActions(role.groups))
// 		};
// 	});
// }

const addAllows = (roles) => {
	return roles.map((role) => {
		return {
			...role,
			allows: role.actions.map((action) => {
				return (
					fullAccessActions[action] || {
						name: action,
						options: 0
					}
				);
			})
		};
	});
};

const fullAccessRoles = addAllows(makeRoles(accessRoles));

console.log(fullAccessRoles);

export const getRoleWeight = (role) => {
	return fullAccessRoles.findIndex((r) => r.name === role) + 1;
};

export const getRoleAllows = (role) => {
	const roleData = fullAccessRoles.find((r) => r.name === role);
	return roleData.allows;
};

const getRolesWeight = (roles) => {
	let max = -1;

	roles.forEach((role) => {
		const current = getRoleWeight(role);

		if (current > max) {
			max = current;
		}
	});

	return max;
};

const checkAccessByRolesData = (actionName, actionData, roles) => {
	let allow = false;

	for (const roleName of roles) {
		const roleData = fullAccessRoles.find((r) => r.name === roleName);

		if (!roleData) {
			throw new Error(`Role ${roleName} not found`);
		}

		const joinGroups = [...roleData.groups, ...actionData.groups];

		if (joinGroups.length != uniq(joinGroups).length) {
			allow = true;
			break;
		}

		if (roleData.actions.includes(actionName)) {
			allow = true;
			break;
		}
	}

	return allow;
};

const checkAccessByActionData = (actionData, current, context) => {
	if (!actionData.context) return true;
	if (actionData.self && current.id == context.id) return true;
	if (!actionData.self && current.id == context.id) return false;

	if (actionData.hierarchy) {
		const currentWeight = getRolesWeight(current.roles);
		const contextWeight = getRolesWeight(context.roles);

		if (currentWeight <= contextWeight) {
			return false;
		}
	}

	return true;
};

export const checkAccess = (action, current, context) => {
	const actionData = fullAccessActions[action];

	if (!actionData) {
		throw new Error(`Action ${action} not found`);
	}

	if (!checkAccessByRolesData(action, actionData, current.roles)) {
		return false;
	}

	if (!checkAccessByActionData(actionData, current, context)) {
		return false;
	}

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
