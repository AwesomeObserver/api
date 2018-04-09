import { Access } from 'core/lib/Access';
import { broker } from 'core';
import { actions as allActions } from 'app/accessNew/actions';
import { roles as allRoles } from 'app/accessNew/roles';

export const access = new Access(allActions, allRoles);

const getUserData = async (userId: number, roomId?: number) => {
	let user = null;

	if (roomId) {
		user = await broker.call('roomUser.getOneFull', {
			roomId,
			userId
		});
	} else {
		user = await broker.call('user.getOne', { userId });
	}

	return user;
};

export const accessCheck = async ({
	name,
	userId,
	userId2,
	roomId
}: {
	name: string;
	userId: number;
	userId2?: number;
	roomId?: number;
}) => {
	const actionData = access.getAction(name);

	if (actionData.context && !userId2) {
		throw new Error(`Need user2 for ${name}`);
	}

	let user = await getUserData(userId, roomId);
	let user2 = userId2 ? await getUserData(userId, roomId) : null;

	if (userId2 && !user2) {
		throw new Error(`User2 not found`);
	}

	console.log(actionData, user);

	throw new Error('Deny');
};
