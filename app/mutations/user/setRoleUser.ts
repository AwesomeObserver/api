import { access, accessCheck, broker } from 'core';

export const schema = `
  setRoleUser(
    userId: Int!,
    role: String!
  ): Boolean
`;

export async function resolver(
	root: any,
	args: {
		userId: number;
		role: string;
	},
	ctx: any
) {
	const { userId, role } = args;
	const currentUserId = ctx.userId;

	if (userId === currentUserId) {
		throw new Error('Cannot set role yourself');
	}

	const [current, context] = await Promise.all([
		broker.call('user.getOne', { userId: currentUserId }),
		broker.call('user.getOne', { userId })
	]);

	await accessCheck('setRole', current, context);

	switch (role) {
		case 'admin':
			accessCheck('setRoleAdmin', current, context);
			break;
		case 'user':
			accessCheck('setRoleUser', current, context);
			break;
		default:
			throw new Error('Deny');
	}

	const currentWeight = access.getRole(current.site.role).weight;
	const contextWeight = access.getRole(context.site.role).weight;

	if (currentWeight <= contextWeight) {
		throw new Error('RoleWeightDeny');
	}

	return broker.call('user.setRole', { userId, role });
}
