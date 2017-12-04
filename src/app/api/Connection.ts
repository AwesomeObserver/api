import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

const {
  TOKEN_SECRET,
  AUTH_KEY_SECRET
} = process.env;

export default class {
  GG: any;

  constructor(GG) {
    this.GG = GG;
  }

  genToken(userId: string): string {
    return jwt.sign(userId, TOKEN_SECRET);
  }

  checkToken(token: string): string {
    return jwt.verify(token, TOKEN_SECRET);
  }

  auth(connectionKey, userId) {
    const token = this.genToken(userId);

    const payload = {
      onConnectionAuth: token,
      connectionKey
    };
    
    this.GG.pubsub.publish('onConnectionAuth', payload);
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