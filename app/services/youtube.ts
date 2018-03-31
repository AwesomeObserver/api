import { Service, Action, BaseSchema } from 'moleculer-decorators';
import * as fetch from 'node-fetch';
import * as queryString from 'query-string';
import { broker } from 'core/broker';

const { YT_KEY } = process.env;

const toSeconds = (duration) => {
	const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

	const hours = parseInt(match[1]) || 0;
	const minutes = parseInt(match[2]) || 0;
	const seconds = parseInt(match[3]) || 0;

	return hours * 3600 + minutes * 60 + seconds;
};

export const setupYoutubeService = () => {
	@Service({
		name: 'youtube'
	})
	class YoutubeService extends BaseSchema {
		@Action()
		async getOne(ctx) {
			const { videoId, isMany } = ctx.params;

			const params = queryString.stringify({
				key: YT_KEY,
				part: 'snippet, contentDetails',
				id: videoId
			});

			return fetch(
				`https://www.googleapis.com/youtube/v3/videos?${params}`
			)
				.then((r) => r.text())
				.then((b) => JSON.parse(b))
				.then((res) => {
					return res.items.map(({ id, snippet, contentDetails }) => {
						return {
							service: 'youtube',
							serviceId: id,
							title: snippet.title,
							cover: snippet.thumbnails.default.url,
							duration: toSeconds(contentDetails.duration),
							url: `https://youtu.be/${id}`
						};
					});
				})
				.then((res) => (isMany ? res : res[0]));
		}

		// @Action()
		// search(ctx) {
		//   const { query, limit } = ctx.params;

		//   const params = queryString.stringify({
		//     key: YT_KEY,
		//     q: query,
		//     part: "id",
		//     type: 'video',
		//     maxResults: limit || 10
		//   });

		//   return fetch(`https://www.googleapis.com/youtube/v3/search?${params}`)
		//     .then(r => r.text())
		//     .then(b => JSON.parse(b))
		//     .then(res => {
		//       return res.items.reduce((ids, item) => {
		//         return `${ids}${item.id.videoId}, `;
		//       }, ``).slice(0,-2);
		//     })
		//     .then(ids => this.getTrackById(ids, true));
		// }
	}

	return broker.createService(YoutubeService);
};
