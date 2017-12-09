import { Connection } from './Connection';
import { RoomEvents } from '../room/RoomEvents';

export class ConnectionEventsClass {

  async onJoin(connectionId: string) {
    return Connection.save(connectionId);
  }

  async onLeave(connectionId: string) {
    const { roomId, userId } = await Connection.getOne(connectionId);

    if (roomId) {
      await RoomEvents.onLeave(roomId, connectionId);
    }
    
    return Connection.del(connectionId);
  }

  async onLogin(connectionId: string, userId: number) {
    await Connection.setUserId(connectionId, userId);
  
    const { roomId } = await Connection.getOne(connectionId);;
  
    if (roomId) {
      await RoomEvents.onLogin(roomId, connectionId, userId);
    }
  
    return true;
  }

  async onLogout(connectionId: string) {
    const { roomId, userId } = await Connection.getOne(connectionId);
  
    await Connection.setUserId(connectionId, null);
    
    if (roomId) {
      await RoomEvents.onLogout(roomId, connectionId, userId);
    }
  
    return true;
  }
}

export const ConnectionEvents = new ConnectionEventsClass();