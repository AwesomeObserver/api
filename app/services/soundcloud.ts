import { Service, Action, BaseSchema } from 'moleculer-decorators';
import * as fetch from 'node-fetch';
import * as queryString from 'query-string';
import { broker } from 'core/broker';

const { SC_KEY } = process.env;

const parse = (track) => {
  let cover = null;

  if (track.artwork_url) {
    cover = track.artwork_url.replace(/large/, 't500x500');
  }

  return {
    service: 'soundcloud',
    serviceId: track.id,
    cover: cover,
    title: track.title,
    duration: Math.floor(parseInt(track.duration) / 1000),
    url: track.permalink_url
  }
}

export const setupSoundcloudService = () => {
  @Service({
    name: 'soundcloud'
  })
  class SoundcloudService extends BaseSchema {

    @Action()
    async getByUrl(ctx) {
      const { url } = ctx.params;
      const params = queryString.stringify({
        client_id: SC_KEY,
        url
      });
    
      return fetch(`http://api.soundcloud.com/resolve?${params}`)
        .then(r => r.text())
        .then(b => JSON.parse(b))
        .then(res => parse(res));
    }

    // public getTrackById = (trackId) => {
    //   const params = queryString.stringify({
    //     client_id: SC_KEY
    //   });
    
    //   return fetch(`http://api.soundcloud.com/tracks/${trackId}?${params}`)
    //     .then(r => r.text())
    //     .then(b => JSON.parse(b))
    //     .then(res => this.parse(res));
    // }

    // public search = (query, limit = 10) => {
    //   const params = queryString.stringify({
    //     client_id: SC_KEY,
    //     q: query,
    //     limit: limit
    //   });
    
    //   return fetch(`http://api.soundcloud.com/tracks?${params}`)
    //     .then(r => r.text())
    //     .then(b => JSON.parse(b))
    //     .then(res => res.map(track => this.parse(track)));
    // }
  }

  return broker.createService(SoundcloudService);
}