import { Service, Action, BaseSchema } from 'moleculer-decorators';
import { getManager, getRepository, getConnection } from "typeorm";
import { broker } from 'core';
import { Source as SourceEntity } from 'app/entity/Source';

export const setupSourceService = () => {
  const repository = getRepository(SourceEntity);
  const manager = getManager();

  @Service({
    name: 'source'
  })
  class SourceService extends BaseSchema {

    //@ts-ignore
    @Action({
      cache: {
        keys: ["sourceId"]
      },
      params: {
        sourceId: "number"
      }
    })
    async getOne(ctx) {
      const { sourceId } = ctx.params;
      return repository.findOne({ id: sourceId });
    }

    //@ts-ignore
    @Action({
      cache: {
        keys: ["videoId"]
      },
      params: {
        videoId: "string"
      }
    })
    async getByYoutubeId(ctx) {
      return repository.findOne({
        service: 'youtube',
        serviceId: ctx.params.videoId
      });
    }

    //@ts-ignore
    @Action({
      cache: {
        keys: ["trackURL"]
      },
      params: {
        trackURL: "string"
      }
    })
    async getBySoundcloudUrl(ctx) {
      return repository.findOne({
        service: 'soundcloud',
        url: ctx.params.trackURL
      });
    }
    
    @Action()
    async addFromLink(ctx) {
      const { link, useTimecode } = ctx.params;
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

        const source: any = await broker.call('source.addFromYoutubeById', {
          videoId: ytRegexRes[4]
        });
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
          
          start = h * 3600 + m * 60 + s;
        }

        const source: any = await broker.call('source.addFromSoundcloudByUrl', {
          url: scRegexRes[0]
        });
        return { source, start };
      }

      return { source: null, start };
    }

    @Action()
    async save(ctx) {
      const { data } = ctx.params;
      let source = new SourceEntity();

      for (const name of Object.keys(data)) {
        source[name] = data[name];
      }

      return manager.save(source);
    }

    @Action()
    async addFromYoutubeById(ctx) {
      const { videoId } = ctx.params;
      
      const source = await broker.call('source.getByYoutubeId', { videoId });

      if (source) return source;

      const data: any = await broker.call('youtube.getOne', { videoId });

      if (!data) return null;

      const newSource = await broker.call('source.save', { data });
      await broker.cacher.del(`source.getByYoutubeId:${videoId}`);
      return newSource;
    }

    // ToDo: valid url
    @Action()
    async addFromSoundcloudByUrl(ctx) {
      const { url } = ctx.params;
      const trackURL = url.match(/([^#])+/)[0];
      const source = await broker.call('source.getBySoundcloudUrl', { trackURL });

      if (source) return source;

      const data: any = await broker.call('soundcloud.getByUrl', {
        url: trackURL
      });
      
      if (!data) return null;

      const newSource = await broker.call('source.save', { data });
      await broker.cacher.del(`source.getBySoundcloudUrl:${trackURL}`);
      return newSource;
    }
  }

  return broker.createService(SourceService);
}
