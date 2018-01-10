import { pubSub } from 'core/pubsub';
import { connectionAPI, roomConnectionAPI } from 'app/api';

export class RoomEventsAPI {

  async onJoin(roomId: number, connectionId: string) {
    const connection = await connectionAPI.getOne(connectionId);
  
    if (!connection) {
      throw new Error('Connection not found');
    }
  
    const { userId } = connection;

    const isNotExist = await roomConnectionAPI.set(roomId, connectionId);

    if (!isNotExist) {
      return false;
    }
  
    await connectionAPI.setRoomId(connectionId, roomId);
  
    if (userId) {
      return this.onUserJoin(roomId, connectionId, userId);
    } else {
      return this.onGuestJoin(roomId, connectionId);
    }
  }

  async onGuestJoin(roomId: number, connectionId: string) {
    return roomConnectionAPI.incGuestsCount(roomId);
  }

  async onUserJoin(roomId: number, connectionId: string, userId: number) {
    const cCount = await connectionAPI.getCCountUserRoom(roomId, userId);
  
    await connectionAPI.incCCountUserRoom(roomId, userId);
  
    if (cCount > 0) {
      return this.onUserJoinAgain(roomId, connectionId, userId);
    } else {
      return this.onUserJoinFirst(roomId, connectionId, userId);
    }
  }

  async onUserJoinAgain(roomId: number, connectionId: string, userId: number) {

  }

  async onUserJoinFirst(roomId: number, connectionId: string, userId: number) {
    return roomConnectionAPI.incUsersCount(roomId);
  }

  async onLeave(roomId: number, connectionId: string) {
    const connection = await connectionAPI.getOne(connectionId);
  
    if (!connection) {
      throw new Error('Connection not found');
    }

    const { userId } = connection;
  
    const isNotExist = await roomConnectionAPI.del(roomId, connectionId);
    
    if (!isNotExist) {
      return false;
    }
  
    await connectionAPI.setRoomId(connectionId, null);
  
    if (userId) {
      return this.onUserLeave(roomId, connectionId, userId);
    } else {
      return this.onGuestLeave(roomId, connectionId);
    }
  }

  async onGuestLeave(roomId: number, connectionId: string) {
    return roomConnectionAPI.decGuestsCount(roomId);
  }

  async onUserLeave(roomId: number, connectionId: string, userId: number) {
    const cCount = await connectionAPI.getCCountUserRoom(roomId, userId);
  
    await connectionAPI.decCCountUserRoom(roomId, userId);
  
    if (cCount > 1) {
      return this.onUserLeaveSome(roomId, connectionId, userId);
    } else {
      return this.onUserLeaveLast(roomId, connectionId, userId);
    }
  }

  async onUserLeaveSome(roomId: number, connectionId: string, userId: number) {
   
  }

  async onUserLeaveLast(roomId: number, connectionId: string, userId: number) {
    roomConnectionAPI.decUsersCount(roomId);
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

    const counts = await roomConnectionAPI.getCount(roomId);
    
    pubSub.publish('connectionsCountChanged', counts, { roomId });
  }
}