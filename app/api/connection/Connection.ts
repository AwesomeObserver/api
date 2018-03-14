import { ConnectionModel } from 'app/models/Connection';
import { connectionEventsAPI, roomEventsAPI } from 'app/api';

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

	async save(connectionId: string, instanceId: string) {
		return new this.Model({
			connectionId,
			instanceId
		}).save();
	}

	async setRoomId(connectionId: string, roomId?: number) {
		return this.Model.findOneAndUpdate({
			connectionId
		}, {
			$set: { roomId }
		});
	}

	async setUserId(connectionId: string, userId?: number) {
		return this.Model.findOneAndUpdate({
			connectionId
		}, {
			$set: { userId }
		});
	}

	async del(connectionId: string) {
		return this.Model.remove({ connectionId });
	}

	async removeInstanceConnections(instanceId: string) {
		const instanceConnections = await this.Model.find({ instanceId });

		const roomsIds = new Map();

		instanceConnections.forEach(({ roomId }) => {
			if (roomId) {
				if (!roomsIds.has(roomId)) {
					roomsIds.set(roomId, roomId);
					roomEventsAPI.onConnectionsCountChanged(roomId);
				}
			}
		});

		return this.Model.remove({ instanceId });
  }
}
