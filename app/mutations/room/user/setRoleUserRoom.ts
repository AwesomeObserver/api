import { access, accessCheck, broker } from 'core';

export const schema = `
  setRoleUserRoom(
    roomId: Int!,
    userId: Int!,
    role: String!
  ): Boolean
`;

export async function resolver(
	root,
	args: {
		roomId: number;
		userId: number;
		role: string;
	},
	ctx: any
) {
	const { roomId, userId, role } = args;
	const currentUserId = ctx.userId;

	if (userId === currentUserId) {
		throw new Error('Connot set role yourself');
	}

	const [current, context] = await Promise.all([
		broker.call('roomUser.getOneFull', { roomId, userId: currentUserId }),
		broker.call('roomUser.getOneFull', { roomId, userId })
	]);

	await accessCheck('setRoleRoom', current, context);

	switch (role) {
		case 'manager':
			accessCheck('setRoleRoomManager', current, context);
			break;
		case 'mod':
			accessCheck('setRoleRoomMod', current, context);
			break;
		case 'user':
			accessCheck('setRoleRoomUser', current, context);
			break;
		default:
			throw new Error('Deny');
	}

	const currentW = access.getRole(current.site.role).weight;
	const contextW = access.getRole(context.site.role).weight;
	const currentWR = access.getRole(current.room.role).weight;
	const contextWR = access.getRole(context.room.role).weight;
	const currentWMax = currentW > currentWR ? currentW : currentWR;
	const contextWMax = contextW > contextWR ? contextW : contextWR;

	if (currentWMax <= contextWMax) {
		throw new Error('RoleWeightDeny');
	}

	return broker.call('roomUser.setRole', {
		roleData: {
			roomId,
			userId,
			role,
			whoSetId: currentUserId
		}
	});
}
