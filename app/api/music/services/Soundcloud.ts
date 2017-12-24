import * as fetch from 'node-fetch';
import * as queryString from 'query-string';
const { SC_KEY } = process.env;

class SoundcloudClass {

  private parse = (track) => {
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

  public getTrackById = (trackId) => {
    const params = queryString.stringify({
      client_id: SC_KEY
    });
  
    return fetch(`http://api.soundcloud.com/tracks/${trackId}?${params}`)
      .then(r => r.text())
      .then(b => JSON.parse(b))
      .then(res => this.parse(res));
  }

  public getTrackByUrl = (url) => {
    const params = queryString.stringify({
      client_id: SC_KEY,
      url
    });
  
    return fetch(`http://api.soundcloud.com/resolve?${params}`)
      .then(r => r.text())
      .then(b => JSON.parse(b))
      .then(res => this.parse(res));
  }

  public search = (query, limit = 10) => {
    const params = queryString.stringify({
      client_id: SC_KEY,
      q: query,
      limit: limit
    });
  
    return fetch(`http://api.soundcloud.com/tracks?${params}`)
      .then(r => r.text())
      .then(b => JSON.parse(b))
      .then(res => res.map(track => this.parse(track)));
  }
}

export const Soundcloud = new SoundcloudClass();