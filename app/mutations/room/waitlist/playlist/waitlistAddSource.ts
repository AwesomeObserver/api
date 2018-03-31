import { accessCheck, broker } from 'core';

export const schema = `
  waitlistAddSource(roomId: Int!, link: String!, useTimecode: Boolean): Boolean
`;

async function access(userId: number) {
	const current = await broker.call('user.getOne', { userId });
	await accessCheck('waitlistAddSource', current);
}

export async function resolver(
	root: any,
	args: {
		roomId: number;
		link: string;
		useTimecode?: boolean;
	},
	ctx: any
) {
	const { roomId, link, useTimecode } = args;
	const userId = ctx.userId;

	await access(userId);

	return broker.call('roomUserPlaylist.addFromLink', {
		roomId,
		userId,
		link,
		useTimecode
	});
}
