import { broker } from 'core';
import { parsePlaySource } from 'core/utils';
import { getTime } from 'date-fns';

export const schema = `
  getWaitlist(roomId: Int!): WaitlistPlay
`;

export async function resolver(
	root: any,
	args: {
		roomId: number;
	},
	ctx: any
) {
	const { roomId } = args;

	const [data, playlist]: any = await Promise.all([
		broker.call('roomWaitlist.get', { roomId }),
		broker.call('roomUserPlaylist.getWithCreate', {
			roomId,
			userId: ctx.userId
		})
	]);

	let sourcesIds = [];

	if (playlist) {
		sourcesIds = playlist.sources;
	}

	const sources = await Promise.all(
		sourcesIds.map(async (sourceData) => {
			const { sourceId, start } = parsePlaySource(sourceData);
			const source: any = await broker.call('source.getOne', {
				sourceId
			});
			return { source, start };
		})
	);

	let users: any = await Promise.all(
		data.users.map((userId) => {
			return broker.call('user.getOne', { userId: parseInt(userId, 10) });
		})
	);

	let playData = null;

	if (data.start) {
		playData = {
			source: data.source,
			user: data.user || broker.call('roomCollection.getBotData'),
			start: getTime(data.start),
			serverTime: +new Date()
		};
	}

	users = users.map((userData) => {
		if (!userData) {
			return broker.call('roomCollection.getBotData');
		}

		return userData;
	});

	return {
		userPlaylist: sources,
		users,
		playData
	};
}
