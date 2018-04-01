import { merge, flip, union, uniq } from 'ramda';
import {
	actions as allActions,
	roles as allRoles
} from '../app/access/actionsNew';

interface Action {
	name: string;
	groups?: string[];
	context?: boolean;
	hierarchy?: boolean;
	self?: boolean;
}

interface PureAction {
	name: string;
	groups: string[];
	context: boolean;
	hierarchy: boolean;
	self: boolean;
}

interface Role {
	name: string;
	extend?: string;
	actions?: string[];
	groups?: string[];
}

interface PureRole {
	name: string;
	actions: string[];
}

export class Access {
	actions: PureAction[];
	roles: PureRole[];
	actionMask = {
		// Нужна ли инфа о пользователе в контексте
		context: false,
		// Cлабые роли не могут применить действие на более сильные
		hierarchy: true,
		// Можно ли применть действие к себе
		self: false
	};

	constructor(actions, roles) {
		if (!actions) {
			throw new Error('Actions is required');
		}

		if (!roles) {
			throw new Error('Roles is required');
		}

		this.actions = this.extendActions(actions);
		this.roles = this.extendRoles(roles);

		console.log(this.roles);
	}

	extendAction = (action: Action): PureAction => {
		let newActions: any = flip(merge)(action, this.actionMask);

		if (action['groups']) {
			newActions.groups = ['global', ...action['groups']];
		} else {
			newActions.groups = ['global'];
		}

		return newActions;
	};

	extendActions = (actions: Action[]): PureAction[] => {
		return actions.map(this.extendAction);
	};

	extendRole = (role, roles) => {
		const pureExtRole = roles.find((r) => r.name === role.extend);

		if (!pureExtRole) {
			throw new Error('Role for extend not found');
		}

		const extRole = pureExtRole.extend
			? this.extendRole(pureExtRole, roles)
			: pureExtRole;

		const groups: any = union(role.groups, extRole.groups);

		// groups.forEach(group => {
		//   this.getGroupActions(group);
		// })

		console.log(role.name, groups);

		// add group actions

		return {
			name: role.name,
			actions: union(role.actions, extRole.actions)
		};
	};

	extendRoles = (roles) => {
		return roles.map((role) => {
			console.log(role);
			let;

			if (role.extend) {
				return this.extendRole(role, roles);
			} else {
				return {
					name: role.name,
					actions: []
				};
			}
		});
	};

	getRole = (role: string) => {
		return this.roles.find(({ name }) => name === role);
	};

	getAction = (action: string) => {
		return this.actions.find(({ name }) => name === action);
	};

	getGroupActions = (group: string) => {
		return this.actions.filter((action) => {
			return action.groups.includes(group);
		});
	};

	makeMask = (role: string) => {
		const roleData = this.getRole(role);
		const allowActions = new Set();

		if (!roleData) {
			throw new Error('Role not exist');
		}

		console.log(roleData);

		if (roleData.actions) {
			roleData.actions.forEach((action) => {
				allowActions.add(action);
			});
		}

		console.log(allowActions);

		return 0;
	};
}

export const access = new Access(allActions, allRoles);
