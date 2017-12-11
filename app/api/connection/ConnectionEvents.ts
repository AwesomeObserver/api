import { Connection } from './Connection';
import { RoomEvents } from '../room/RoomEvents';

export class ConnectionEventsClass {

  async onJoin(connectionId: string) {
    return Connection.save(connectionId);
  }

  async onLeave(connectionId: string) {
    let connection = await Connection.getOne(connectionId);

    if (!connection) {
      console.log('onLeave Error');
      return false;
    }

    const { roomId } = connection;

    if (roomId) {
      await RoomEvents.onLeave(roomId, connectionId);
    }
    
    return Connection.del(connectionId);
  }

  async onLogin(connectionId: string, userId: number) {
    await Connection.setUserId(connectionId, userId);
  
    let connection = await Connection.getOne(connectionId);
    
    if (!connection) {
      console.log('onLogin Error');
      return false;
    }

    const { roomId } = connection;
  
    if (roomId) {
      await RoomEvents.onLogin(roomId, connectionId, userId);
    }
  
    return true;
  }

  async onLogout(connectionId: string) {
    let connection = await Connection.getOne(connectionId);
    
    if (!connection) {
      console.log('onLogout Error');
      return false;
    }

    const { roomId, userId } = connection;

    await Connection.setUserId(connectionId, null);
    
    if (roomId) {
      await RoomEvents.onLogout(roomId, connectionId, userId);
    }
  
    return true;
  }
}

export const ConnectionEvents = new ConnectionEventsClass();