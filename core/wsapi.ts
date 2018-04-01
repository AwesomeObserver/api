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
			connectionId: crypto.randomBytes(16).toString('hex'),
			roomId: null
		};

		actions['connect'](socket.cdata);

		socket.on('message', function(d) {
			const [type, data] = JSON.parse(d);

			if (actions[type]) {
				actions[type](data, socket.cdata).catch((data) => {
					logger.error(data);
				});
			}
		});

		socket.on('close', function() {
			actions['disconnect'](socket.cdata);
		});
	}

	public send = (eventName: string, data: any, filter?: Function) => {
		if (!this.server || !this.server.clients) {
			return false;
		}

		this.server.clients.forEach(function(socket) {
			if (!filter || filter(socket.cdata)) {
				setImmediate(function() {
					const messageData =
						typeof data == 'undefined'
							? [eventName]
							: [eventName, data];
					socket.send(JSON.stringify(messageData));
				});
			}
		});
	};

	public async run() {
		const server = new ws.Server({ port: this.PORT });
		server.on('connection', this.onConnection);

		setInterval(function() {
			server.clients.forEach(function(socket) {
				setImmediate(function() {
					socket.send(undefined);
				});
			});
		}, this.PING_INTERVAL);

		this.server = server;
	}
}

export const wsAPI = new WSAPI();
