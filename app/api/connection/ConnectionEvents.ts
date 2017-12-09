export default class {
  GG: any;

  constructor(GG) {
    this.GG = GG;
  }

  async onJoin(connectionId: string) {
    return this.GG.API.Connection.save(connectionId);
  }

  async onLeave(connectionId: string) {
    const { roomId, userId } = await this.GG.API.Connection.getOne(connectionId);

    if (roomId) {
      await this.GG.API.RoomEvents.onLeave(roomId, connectionId, userId);
    }
    
    return this.GG.API.Connection.del(connectionId);
  }

  async onLogin(connectionId: string, userId: string) {
    await this.GG.API.Connection.setUserId(connectionId, userId);
  
    const { roomId } = await this.GG.API.Connection.getOne(connectionId);;
  
    if (roomId) {
      await this.GG.API.RoomEvents.onLogin(roomId, connectionId, userId);
    }
  
    return true;
  }

  async onLogout(connectionId: string) {
    const { roomId, userId } = await this.GG.API.Connection.getOne(connectionId);
  
    await this.GG.API.Connection.setUserId(connectionId, null);
    
    if (roomId) {
      await this.GG.API.RoomEvents.onLogout(roomId, connectionId, userId);
    }
  
    return true;
  }
}