import { getConnection } from "typeorm";
import { Connection as ConnectionEntity } from 'app/entity/Connection';
import { connectionEventsAPI, roomEventsAPI } from 'app/api';

export class ConnectionAPI {

	get repository() {
    return getConnection().getRepository(ConnectionEntity);
  }

  get manager() {
    return getConnection().manager;
  }

	async getOne(connectionId: string) {
		return this.repository.findOne({ connectionId });
	}

  async getRoomConnections(roomId: number) {
		return this.repository.find({ roomId });
  }
  
  async getUserConnections(userId: number) {
		return this.repository.find({ userId });
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
		let connection = new ConnectionEntity();

		connection.connectionId = connectionId;
		connection.instanceId = instanceId;

		return this.manager.save(connection);
	}

	async setRoomId(connectionId: string, roomId?: number) {
		return this.repository.update({ connectionId }, { roomId });
	}

	async setUserId(connectionId: string, userId?: number) {
		return this.repository.update({ connectionId }, { userId });
	}

	async del(connectionId: string) {
		const connection = await this.getOne(connectionId);

		if (!connection) {
			return  console.error('connection not found');
		}

		return this.repository.remove(connection);
	}

	async removeInstanceConnections(instanceId: string) {
		const instanceConnections = await this.repository.find({ instanceId });

		const roomsIds = new Map();

		instanceConnections.forEach(({ roomId }) => {
			if (roomId) {
				if (!roomsIds.has(roomId)) {
					roomsIds.set(roomId, roomId);
					roomEventsAPI.onConnectionsCountChanged(roomId);
				}
			}
		});

		return this.repository.remove(instanceConnections);
  }
}
