import { PubSub } from 'core/pubsub';
import { Connection } from '../connection/Connection';
import { RoomConnection } from './RoomConnection';

export class RoomEventsClass {

  async onJoin(roomId: number, connectionId: string) {
    const connection = await Connection.getOne(connectionId);
  
    if (!connection) {
      throw new Error('Connection not found');
    }
  
    const { userId } = connection;

    const isNotExist = await RoomConnection.set(roomId, connectionId);

    if (!isNotExist) {
      return false;
    }
  
    await Connection.setRoomId(connectionId, roomId);
  
    if (userId) {
      return this.onUserJoin(roomId, connectionId, userId);
    } else {
      return this.onGuestJoin(roomId, connectionId);
    }
  }

  async onGuestJoin(roomId: number, connectionId: string) {
    return RoomConnection.incGuestsCount(roomId);
  }

  async onUserJoin(roomId: number, connectionId: string, userId: number) {
    const cCount = await Connection.getCCountUserRoom(roomId, userId);
  
    await Connection.incCCountUserRoom(roomId, userId);
  
    if (cCount > 0) {
      return this.onUserJoinAgain(roomId, connectionId, userId);
    } else {
      return this.onUserJoinFirst(roomId, connectionId, userId);
    }
  }

  async onUserJoinAgain(roomId: number, connectionId: string, userId: number) {

  }

  async onUserJoinFirst(roomId: number, connectionId: string, userId: number) {
    return RoomConnection.incUsersCount(roomId);
  }

  async onLeave(roomId: number, connectionId: string) {
    const connection = await Connection.getOne(connectionId);
  
    if (!connection) {
      throw new Error('Connection not found');
    }

    const { userId } = connection;
  
    const isNotExist = await RoomConnection.del(roomId, connectionId);
    
    if (!isNotExist) {
      return false;
    }
  
    await Connection.setRoomId(connectionId, null);
  
    if (userId) {
      return this.onUserLeave(roomId, connectionId, userId);
    } else {
      return this.onGuestLeave(roomId, connectionId);
    }
  }

  async onGuestLeave(roomId: number, connectionId: string) {
    return RoomConnection.decGuestsCount(roomId);
  }

  async onUserLeave(roomId: number, connectionId: string, userId: number) {
    const cCount = await Connection.getCCountUserRoom(roomId, userId);
  
    await Connection.decCCountUserRoom(roomId, userId);
  
    if (cCount > 1) {
      return this.onUserLeaveSome(roomId, connectionId, userId);
    } else {
      return this.onUserLeaveLast(roomId, connectionId, userId);
    }
  }

  async onUserLeaveSome(roomId: number, connectionId: string, userId: number) {
   
  }

  async onUserLeaveLast(roomId: number, connectionId: string, userId: number) {
    RoomConnection.decUsersCount(roomId);
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
    const counts = await RoomConnection.getCount(roomId);
    
    const payload = {
      connectionsCountChanged: counts,
      roomId
    };
    
    // PubSub.publish('connectionsCountChanged', payload);
  }
}

export const RoomEvents = new RoomEventsClass();