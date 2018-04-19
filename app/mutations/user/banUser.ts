import { access, accessCheck, broker } from 'core';

export const schema = `
  banUser(
    userId: Int!,
    reason: String
  ): Boolean
`;

export async function resolver(
	root: any,
	args: {
		userId: number;
		reason?: string;
	},
	ctx: any
) {
	const { userId } = args;
	const currentUserId = ctx.userId;

	if (userId === currentUserId) {
		throw new Error('Cannot ban yourself');
	}

	const [current, context] = await Promise.all([
		broker.call('user.getOne', { userId: currentUserId }),
		broker.call('user.getOne', { userId })
	]);

	await accessCheck('banRoom', current, context);

	const currentWeight = access.getRole(current.site.role).weight;
	const contextWeight = access.getRole(context.site.role).weight;

	if (currentWeight <= contextWeight) {
		throw new Error('RoleWeightDeny');
	}

	return broker.call('user.ban', { userId });
}
