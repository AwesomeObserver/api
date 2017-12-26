import { connectionAPI, roomEventsAPI } from 'app/api';

export class ConnectionEventsAPI {

  async onJoin(connectionId: string) {
    return connectionAPI.save(connectionId);
  }

  async onLeave(connectionId: string) {
    let connection = await connectionAPI.getOne(connectionId);

    if (!connection) {
      console.log('onLeave Error');
      return false;
    }

    const { roomId } = connection;

    if (roomId) {
      await roomEventsAPI.onLeave(roomId, connectionId);
    }
    
    return connectionAPI.del(connectionId);
  }

  async onLogin(connectionId: string, userId: number) {
    await connectionAPI.setUserId(connectionId, userId);
  
    let connection = await connectionAPI.getOne(connectionId);
    
    if (!connection) {
      console.log('onLogin Error');
      return false;
    }

    const { roomId } = connection;
  
    if (roomId) {
      await roomEventsAPI.onLogin(roomId, connectionId, userId);
    }
  
    return true;
  }

  async onLogout(connectionId: string) {
    let connection = await connectionAPI.getOne(connectionId);
    
    if (!connection) {
      console.log('onLogout Error');
      return false;
    }

    const { roomId, userId } = connection;

    await connectionAPI.setUserId(connectionId, null);
    
    if (roomId) {
      await roomEventsAPI.onLogout(roomId, connectionId, userId);
    }
  
    return true;
  }
}