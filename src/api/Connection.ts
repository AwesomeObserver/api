import * as crypto from 'crypto';

export default class {
  GG: any;

  constructor(GG) {
    this.GG = GG;
  }

  onConnect(connectionParams, webSocket) {
    const connectionId = crypto.randomBytes(20).toString('hex');
    webSocket['connectionId'] = connectionId;

    console.log('onConnect');

    return {
      GG: this.GG,
      connectionId
    };
  }

  onDisconnect(webSocket) {
    console.log('onDisconnect', webSocket.connectionId);
  }
}