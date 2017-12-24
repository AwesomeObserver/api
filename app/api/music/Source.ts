import { getConnection } from "typeorm";
import { Source as SourceEntity } from 'app/entity/Source';
import { Youtube } from 'app/api/music/services/Youtube';
import { Soundcloud } from 'app/api/music/services/Soundcloud';

class SourceClass {

  get repository() {
    return getConnection().getRepository(SourceEntity);
  }

  get manager() {
    return getConnection().manager;
  }

  addFromLink = async (link: string) => {
    const ytRegex = /((www\.|)youtube\.com|youtu\.?be)\/(watch\?v=|v|embed\/|)([^\?\&\s]+)/;
    const scRegex = /(https?:\/\/soundcloud.com\/.+)/;

    const ytRegexRes = link.match(ytRegex);

    if (ytRegexRes && ytRegexRes[4]) {
      return this.addFromYoutubeById(ytRegexRes[4]);
    }

    const scRegexRes = link.match(scRegex);

    if (scRegexRes) {
      return this.addFromSoundcloudByUrl(scRegexRes[0]);
    }

    return false;
  }

  getOne = async (where) => {
    return this.repository.findOne({ where, cache: true });
  }

  getById = async (sourceId) => {
    return this.getOne({ id: sourceId });
  }

  save = async (data) => {
    let source = new SourceEntity();

    for (const name of Object.keys(data)) {
      source[name] = data[name];
    }

    return this.manager.save(source);
  }

  addFromYoutubeById = async (videoId: string) => {
    const source = await this.getOne({
      service: 'youtube',
      serviceId: videoId
    });

    if (source) {
      return source.id;
    }

    const data = await Youtube.getTrackById(videoId);

    if (!data) {
      return false;
    }

    const newSource = await this.save(data);

    return newSource.id;
  }

  addFromSoundcloudByUrl = async (url: string) => {
    const source = await this.getOne({ service: 'soundcloud', url });

    if (source) {
      return source.id;
    }

    const data = await Soundcloud.getTrackByUrl(url);

    if (!data) {
      return false;
    }

    const newSource = await this.save(data);

    return newSource.id;
  }
}

export const Source = new SourceClass();