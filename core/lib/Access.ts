import { union } from 'ramda';

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
	weight: number;
	actions: string[];
	allows: PureAction[];
	groups: string[];
}

interface Roles {
	permission: number;
	weight: number;
}

interface Group {
	name: string;
	actions: string[];
}

export class Access {
	actions: PureAction[];
	roles: PureRole[];
	groups: Group[];

	constructor(actions: Action[], roles: Role[]) {
		if (!actions || !roles) {
			throw new Error('Actions and Roles is required');
		}

		this.actions = this.extendActions(actions);
		this.groups = this.collectGroups();
		this.roles = this.extendRoles(roles);
	}

	extendAction = (action: Action): PureAction => {
		const orDefault = (value, defaultValue) => {
			return typeof value === 'boolean' ? value : defaultValue;
		};

		let newAction = {
			name: action.name,
			context: orDefault(action.context, false),
			hierarchy: orDefault(action.hierarchy, true),
			self: orDefault(action.self, false),
			groups: ['global']
		};

		if (action['groups']) {
			newAction.groups = ['global', ...action['groups']];
		}

		return newAction;
	};

	extendActions = (actions: Action[]): PureAction[] => {
		return actions.map(this.extendAction);
	};

	collectGroups = (actions: PureAction[] = this.actions): Group[] => {
		const groups = {};

		this.actions.forEach((action) => {
			action.groups.forEach((group) => {
				if (!groups[group]) {
					groups[group] = {
						name: group,
						actions: []
					};
				}

				groups[group].actions.push(action.name);
			});
		});

		return Object.values(groups);
	};

	extendRole = (role: Role, roles: Role[]): PureRole => {
		const name = role.name;
		const weight = roles.findIndex(({ name }) => name === role.name) + 1;
		let actions = role.actions || [];
		let groups = role.groups || [];

		if (role.extend) {
			const extRole = roles.find(({ name }) => name === role.extend);
			const extPureRole = this.extendRole(extRole, roles);
			actions = union(actions, extPureRole.actions);
			groups = union(groups, extPureRole.groups);
		}

		if (role.groups) {
			role.groups.forEach((group) => {
				const groupActions = this.getGroup(group).actions;
				actions = union(actions, groupActions);
			});
		}

		const allows = actions.map((action) => this.getAction(action));

		return {
			name,
			actions,
			groups,
			allows,
			weight
		};
	};

	extendRoles = (roles: Role[]): PureRole[] => {
		return roles.map((role) => this.extendRole(role, roles));
	};

	getRole = (role: string): PureRole => {
		return this.roles.find(({ name }) => name === role);
	};

	getAction = (action: string): PureAction => {
		const actionData = this.actions.find(({ name }) => name === action);

		if (!actionData) {
			throw new Error(`Action ${action} not exist`);
		}

		return actionData;
	};

	getGroup = (group: string): Group => {
		return this.groups.find(({ name }) => name === group);
	};

	// getRolesData = (roles: string[]): Roles => {
	// 	let permission = 0;
	// 	let weight = 0;

	// 	roles.forEach((role, i) => {
	// 		const roleData = this.getRole(role);
	// 		permission = permission | roleData.permission;

	// 		if (roleData.weight > weight) {
	// 			weight = roleData.weight;
	// 		}
	// 	});

	// 	return { permission, weight };
	// };

	// checkByPermission = (action: string, permission: number): boolean => {
	// 	const actionData = this.getAction(action);
	// 	return !!(actionData.access & permission);
	// };

	// checkByRoles = (action: string, roles: string[]): boolean => {
	// 	const actionData = this.getAction(action);
	// 	const rolesData = this.getRolesData(roles);
	// 	return !!(actionData.access & rolesData.permission);
	// };
}
