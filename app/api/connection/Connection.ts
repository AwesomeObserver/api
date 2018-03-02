import { ConnectionModel } from 'app/models/Connection';

export class ConnectionAPI {
	get Model() {
		return ConnectionModel;
	}

	async getOne(connectionId: string) {
		return this.Model.findOne({ connectionId });
	}

  async getRoomConnections(roomId: number) {
		return this.Model.find({ roomId });
  }
  
  async getUserConnections(userId: number) {
		return this.Model.find({ userId });
	}

	async getRoomCounts(roomId: number) {
		const connections = await this.getRoomConnections(roomId);
		let users = new Map();
		let guestsCount = 0;

		connections.forEach(connection => {
			if (connection.userId) {
				users.set(connection.userId, 1);
			} else {
				guestsCount++;
			}
		});

		const usersCount = users.size;

		return { 
      connectionsCount: usersCount + guestsCount, 
      usersCount, 
      guestsCount, 
    };  
	}
}
