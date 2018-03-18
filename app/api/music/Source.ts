import { getConnection } from 'typeorm';
import { Source as SourceEntity } from 'app/entity/Source';
import { youtubeAPI, soundcloudAPI } from 'app/api';

export class SourceAPI {
	get repository() {
		return getConnection().getRepository(SourceEntity);
	}

	get manager() {
		return getConnection().manager;
	}

	addFromLink = async (link: string, useTimecode: boolean) => {
		let start = 0;
		const ytRegex = /((www\.|)youtube\.com|youtu\.?be)\/(watch\?v=|v|embed\/|)([^\?\&\s]+)/;
		const scRegex = /(https?:\/\/soundcloud.com\/.+)/;

		const ytRegexRes = link.match(ytRegex);

		if (ytRegexRes && ytRegexRes[4]) {
			const ytTimeCodeRegex = /t=(([0-9]+)h|)(([0-9]+)m|)(([0-9]+)s|)/;
			const ytTimeCodeRegexRes = link.match(ytTimeCodeRegex);

			if (ytTimeCodeRegexRes && useTimecode) {
				const h = parseInt(ytTimeCodeRegexRes[2], 10) || 0;
				const m = parseInt(ytTimeCodeRegexRes[4], 10) || 0;
				const s = parseInt(ytTimeCodeRegexRes[6], 10) || 0;

				start = h * 3600 + m * 60 + s;
			}

			const source = await this.addFromYoutubeById(ytRegexRes[4]);
			return { source, start };
		}

		const scRegexRes = link.match(scRegex);

		if (scRegexRes) {
			const scTimeCodeRegex = /t=(([0-9]+):|)(([0-9]+):|)(([0-9]+)|)$/;
			const scTimeCodeRegexRes = link.match(scTimeCodeRegex);

			if (scTimeCodeRegexRes && useTimecode) {
				let h = parseInt(scTimeCodeRegexRes[2], 10) || 0;
				let m = parseInt(scTimeCodeRegexRes[4], 10) || 0;
				let s = parseInt(scTimeCodeRegexRes[6], 10) || 0;

				if (typeof scTimeCodeRegexRes[4] === 'undefined') {
					m = h;
					h = 0;
				}

				console.log(scTimeCodeRegexRes, h, m, s);
				start = h * 3600 + m * 60 + s;
			}

			const source = await this.addFromSoundcloudByUrl(scRegexRes[0]);
			return { source, start };
		}

		return { source: null, start };
	};

	getOne = async (where) => {
		return this.repository.findOne({ where });
	};

	getById = async (sourceId) => {
		return this.getOne({ id: sourceId });
	};

	save = async (data) => {
		let source = new SourceEntity();

		for (const name of Object.keys(data)) {
			source[name] = data[name];
		}

		return this.manager.save(source);
	};

	addFromYoutubeById = async (videoId: string) => {
		const source = await this.getOne({
			service: 'youtube',
			serviceId: videoId
		});

		if (source) {
			return source;
		}

		const data = await youtubeAPI.getTrackById(videoId);

		if (!data) {
			return null;
		}

		const newSource = await this.save(data);

		return newSource;
	};

	addFromSoundcloudByUrl = async (url: string) => {
		const pureUrl = url.match(/([^#])+/)[0];
		const source = await this.getOne({ service: 'soundcloud', url: pureUrl });

		if (source) {
			return source;
		}

		const data = await soundcloudAPI.getTrackByUrl(pureUrl);

		if (!data) {
			return null;
		}

		const newSource = await this.save(data);

		return newSource;
	};
}
