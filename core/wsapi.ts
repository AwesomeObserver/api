import * as ws from 'ws';

const actionCode = {
  token: 1
};

export class WSAPI {

  public PORT: number;
  private server: any;

  constructor() {
    this.PORT = 8000;
  }

  private onConnection = (socket) => {
    console.log('Connection open');
    socket.on('message', (data) => this.onMessage(socket, data));
    socket.on('close', (...args) => this.onClose(socket, ...args));

    this.sendMessage(socket, actionCode['token'], 'Test');
  }

  private onMessage = (socket, d) => {
    const [type, data] = JSON.parse(d);

    if (type) {
      console.log({ type, data });
    }
  }

  private onClose = (socket) => {
    console.log('Connection close');
  }

  private sendMessage = (socket, type, data?) => {
    let messageData = typeof data == 'undefined' ? [type] : [type, data];
    socket.send(JSON.stringify(messageData));
  }

  public async run() {
    this.server = new ws.Server({ port: this.PORT });
    this.server.on('connection', this.onConnection);

    setInterval(() => {
      this.server.clients.forEach((socket) => {
        if (socket.readyState === ws.OPEN) {
          socket.send();
        }
      });
    }, 5000);
    
  }
}

export const wsAPI = new WSAPI();