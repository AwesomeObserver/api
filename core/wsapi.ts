import * as crypto from 'crypto';
import * as ws from 'uws';
import * as actions from 'app/wsapi';

export class WSAPI {

  public PORT: number;
  public PING_INTERVAL: number;
  private server: any;

  constructor() {
    this.PORT = 8000;
    this.PING_INTERVAL = 10000;
  }

  private onConnection = (socket) => {
    socket.cdata = {
      connectionId: crypto.randomBytes(16).toString("hex"),
      roomId: null
    };

    socket.on('message', (data) => this.onMessage(socket, data));
    socket.on('close', (...args) => this.onClose(socket, ...args));
  }

  private onMessage = (socket, d) => {
    const [type, data] = JSON.parse(d);

    if (actions[type]) {
      actions[type](data, socket.cdata).catch((data) => {
      });
    }
  }

  private onClose = (socket) => {
    console.log('Connection close');
  }

  private sendMessage = (socket, type, data?) => {
    let messageData = typeof data == 'undefined' ? [type] : [type, data];
    socket.send(JSON.stringify(messageData));
  }

  public send = (eventName: string, data: any, filter?: Function) => {
    this.server.clients.forEach((socket) => {
      if (!filter || filter(socket.cdata)) {
        this.sendMessage(socket, eventName, data);
      }      
    });
  }

  public async run() {
    this.server = new ws.Server({ port: this.PORT });
    this.server.on('connection', this.onConnection);

    setInterval(() => {
      this.server.clients.forEach((socket) => {
        socket.send();
      });
    }, this.PING_INTERVAL);
    
  }
}

export const wsAPI = new WSAPI();