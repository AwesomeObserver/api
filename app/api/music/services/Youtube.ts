import * as fetch from 'node-fetch';
import * as queryString from 'query-string';
const { YT_KEY } = process.env;

class YoutubeClass {

  private toSeconds = (duration) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
  
    const hours = (parseInt(match[1]) || 0);
    const minutes = (parseInt(match[2]) || 0);
    const seconds = (parseInt(match[3]) || 0);
  
    return hours * 3600 + minutes * 60 + seconds;
  }

  public getTrackById = (videoId, isMany = false) => {
    const params = queryString.stringify({
      key: YT_KEY,
      part: 'snippet, contentDetails',
      id: videoId
    });
  
    return fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`)
      .then(r => r.text())
      .then(b => JSON.parse(b))
      .then(res => {
        return res.items.map(({ id, snippet, contentDetails }) => {          
          return {
            service: 'youtube',
            serviceId: id,
            title: snippet.title,
            cover: snippet.thumbnails.default.url,
            duration: this.toSeconds(contentDetails.duration),
            url: `https://youtu.be/${id}`
          }
        });
      })
      .then(res => isMany ? res : res[0]);
  }

  public search = (query, limit = 10) => {
    const params = queryString.stringify({
      key: YT_KEY,
      q: query,
      part: "id",
      type: 'video',
      maxResults: limit
    });
  
    return fetch(`https://www.googleapis.com/youtube/v3/search?${params}`)
      .then(r => r.text())
      .then(b => JSON.parse(b))
      .then(res => {
        return res.items.reduce((ids, item) => {
          return `${ids}${item.id.videoId}, `;
        }, ``).slice(0,-2);
      })
      .then(ids => this.getTrackById(ids, true));
  }

}

export const Youtube = new YoutubeClass();