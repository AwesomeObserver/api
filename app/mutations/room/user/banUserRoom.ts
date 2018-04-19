import { access, accessCheck, broker } from 'core';

export const schema = `
  banUserRoom(
    userId: Int!,
    roomId: Int!,
    reason: String
  ): Boolean
`;

export async function resolver(
	root: any,
	args: {
		userId: number;
		roomId: number;
		reason?: string;
	},
	ctx: any
) {
	const { userId, roomId, reason } = args;
	const currentUserId = ctx.userId;

	if (userId === currentUserId) {
		throw new Error('Connot ban yourself');
	}

	const [current, context] = await Promise.all([
		broker.call('roomUser.getOneFull', { roomId, userId: currentUserId }),
		broker.call('roomUser.getOneFull', { roomId, userId })
	]);

	await accessCheck('banUserRoom', current, context);

	const currentW = access.getRole(current.site.role).weight;
	const contextW = access.getRole(context.site.role).weight;
	const currentWR = access.getRole(current.room.role).weight;
	const contextWR = access.getRole(context.room.role).weight;
	const currentWMax = currentW > currentWR ? currentW : currentWR;
	const contextWMax = contextW > contextWR ? contextW : contextWR;

	if (currentWMax <= contextWMax) {
		throw new Error('RoleWeightDeny');
	}

	return broker.call('roomUser.ban', { roomId, userId });
}
