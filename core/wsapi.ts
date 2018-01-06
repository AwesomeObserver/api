import * as crypto from 'crypto';
import * as ws from 'uws';
import * as actions from 'app/wsapi';
import { logger } from 'core/logger';

export class WSAPI {

  public PORT: number;
  public PING_INTERVAL: number;
  private server: any;

  constructor() {
    this.PORT = 8000;
    this.PING_INTERVAL = 10000;
  }

  private onConnection(socket) {
    socket.cdata = {
      connectionId: crypto.randomBytes(16).toString("hex"),
      roomId: null
    };

    logger.info('Connection open');

    socket.on('message', function(d) {
      const [type, data] = JSON.parse(d);

      if (actions[type]) {
        actions[type](data, socket.cdata).catch((data) => {
          logger.error(data);
        });
      }
    });

    socket.on('close', function() {
      logger.info('Connection close');
    });
  }

  private sendMessage = (socket, type, data?) => {
    const messageData = typeof data == 'undefined' ? [type] : [type, data];
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
    const server = new ws.Server({ port: this.PORT });
    server.on('connection', this.onConnection);

    setInterval(function() {
      server.clients.forEach(function(socket) {
        socket.send(undefined);
      });
    }, this.PING_INTERVAL);

    this.server = server;
  }
}

export const wsAPI = new WSAPI();