import { broker } from 'core';

export const schema = `
  user: User
`;

export async function resolver(root: any, args: any, ctx: any) {
	const { userId } = ctx;

	if (!userId) {
		throw new Error('Deny');
	}

	const user = await broker.call('user.getOne', { userId });

	if (!user) {
		throw new Error('User not found');
	}

	return user;
}
