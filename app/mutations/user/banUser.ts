import { accessCheck, broker } from 'core';

export const schema = `
  banUser(
    userId: Int!,
    reason: String
  ): Boolean
`;

export async function access(currentUserId: number, userId: number) {
	const [current, context] = await Promise.all([
		broker.call('user.getOne', { userId: currentUserId }),
		broker.call('user.getOne', { userId })
	]);

	await accessCheck('banRoom', current, context);
}

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
		throw new Error('Connot ban yourself');
	}

	await access(currentUserId, userId);

	return broker.call('user.ban', { userId });
}
