import { accessCheck, broker } from 'core';

export const schema = `
  setRoleUser(
    userId: Int!,
    role: String!
  ): Boolean
`;

async function access(currentUserId: number, userId: number, role: string) {
	const [current, context] = await Promise.all([
		broker.call('user.getOne', { userId: currentUserId }),
		broker.call('user.getOne', { userId })
	]);

	await accessCheck('setRole', current, context);

	switch (role) {
		case 'admin':
			return accessCheck('setRoleAdmin', current, context);
		case 'user':
			return accessCheck('setRoleUser', current, context);
		default:
			throw new Error('Deny');
	}
}

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

	await access(currentUserId, userId, role);

	return broker.call('user.setRole', { userId, role });
}
