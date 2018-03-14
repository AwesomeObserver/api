import { pubSub } from 'core/pubsub';
import { connectionAPI } from 'app/api';

export class RoomEventsAPI {

  async onJoin(roomId: number, connectionId: string) {
    const connection = await connectionAPI.getOne(connectionId);
  
    if (!connection) {
      throw new Error('Connection not found');
    }
  
    const { userId } = connection;

    await connectionAPI.setRoomId(connectionId, roomId);
  
    if (userId) {
      return this.onUserJoin(roomId, connectionId, userId);
    } else {
      return this.onGuestJoin(roomId, connectionId);
    }
  }

  async onGuestJoin(roomId: number, connectionId: string) {
    return this.onConnectionsCountChanged(roomId);
  }

  async onUserJoin(roomId: number, connectionId: string, userId: number) {
    return this.onConnectionsCountChanged(roomId);
  }

  async onLeave(roomId: number, connectionId: string) {
    const connection = await connectionAPI.getOne(connectionId);
  
    if (!connection) {
      throw new Error('Connection not found');
    }

    const { userId } = connection;
   
    await connectionAPI.setRoomId(connectionId, null);
  
    if (userId) {
      return this.onUserLeave(roomId, connectionId, userId);
    } else {
      return this.onGuestLeave(roomId, connectionId);
    }
  }

  async onGuestLeave(roomId: number, connectionId: string) {
    return this.onConnectionsCountChanged(roomId);
  }

  async onUserLeave(roomId: number, connectionId: string, userId: number) {
    return this.onConnectionsCountChanged(roomId);
  }

  async onLogin(roomId: number, connectionId: string, userId: number) {
    await this.onGuestLeave(roomId, connectionId);
    return this.onUserJoin(roomId, connectionId, userId);
  }

  async onLogout(roomId: number, connectionId: string, userId: number) {    
    await this.onUserLeave(roomId, connectionId, userId);
    return this.onGuestJoin(roomId, connectionId);
  }

  async onConnectionsCountChanged(roomId: number) {
    roomId = parseInt(`${roomId}`, 10);

    const counts = await connectionAPI.getRoomCounts(roomId);
    
    pubSub.publish('connectionsCountChanged', counts, { roomId });
  }
}