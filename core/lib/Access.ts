import { uniq } from '../utils';

interface Action {
	name: string;
	groups?: string[];
}

interface Role {
	name: string;
	extend?: string;
	allows?: string[];
	groups?: string[];
}

interface PureRole {
	name: string;
	weight: number;
	allows: string[];
	groups: string[];
}

interface Roles {
	permission: number;
	weight: number;
}

interface Group {
	name: string;
	allows: string[];
}

export class Access {
	actions: Action[];
	roles: PureRole[];
	groups: Group[];

	constructor(actions: Action[], roles: Role[]) {
		if (!actions || !roles) {
			throw new Error('Actions and Roles is required');
		}

		this.actions = actions;
		this.groups = this.collectGroups();
		this.roles = this.extendRoles(roles);
	}

	collectGroups = (actions: Action[] = this.actions): Group[] => {
		const groups = {};

		this.actions.forEach((action) => {
			if (!action.groups) return;

			action.groups.forEach((group) => {
				if (!groups[group]) {
					groups[group] = {
						name: group,
						allows: []
					};
				}

				groups[group].allows.push(action.name);
			});
		});

		return Object.values(groups);
	};

	extendRole = (role: Role, roles: Role[]): PureRole => {
		const name = role.name;
		const weight = roles.findIndex(({ name }) => name === role.name) + 1;
		let allows = role.allows || [];
		let groups = role.groups || [];

		if (role.extend) {
			const extRole = roles.find(({ name }) => name === role.extend);
			const extPureRole = this.extendRole(extRole, roles);
			allows = uniq([...allows, ...extPureRole.allows]);
			groups = uniq([...groups, ...extPureRole.groups]);
		}

		if (role.groups) {
			role.groups.forEach((group) => {
				const groupAllows = this.getGroup(group).allows;
				allows = uniq([...allows, ...groupAllows]);
			});
		}

		return {
			name,
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

	getAction = (action: string): Action => {
		const actionData = this.actions.find(({ name }) => name === action);

		if (!actionData) {
			throw new Error(`Action ${action} not exist`);
		}

		return actionData;
	};

	getGroup = (group: string): Group => {
		return this.groups.find(({ name }) => name === group);
	};

	isAllowByRole = (roleName: string, actionName: string) => {
		const role = this.getRole(roleName);

		if (!role) {
			throw new Error(`Access: role ${roleName} not exist`);
		}

		return role.allows.includes(actionName);
	};

	isAllowByRoles = (roles: string[], actionName: string) => {
		let allow = false;

		for (const roleName of roles) {
			if (this.isAllowByRole(roleName, actionName)) {
				allow = true;
				break;
			}
		}

		return allow;
	};
}
