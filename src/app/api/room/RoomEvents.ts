export default class {
  GG: any;

  constructor(GG) {
    this.GG = GG;
  }

  async onJoin(roomId: string, connectionId: string) {
    const connection = await this.GG.API.Connection.getOne(connectionId);
  
    if (!connection) {
      throw new Error('Connection not found');
    }
  
    const { userId } = connection;

    const isNotExist = await this.GG.API.RoomConnection.set(roomId, connectionId);

    if (!isNotExist) {
      return false;
    }
  
    await this.GG.API.Connection.setRoomId(connectionId, roomId);
  
    if (userId) {
      return this.onUserJoin(roomId, connectionId, userId);
    } else {
      return this.onGuestJoin(roomId, connectionId);
    }
  }

  async onGuestJoin(roomId: string, connectionId: string) {
    return this.GG.API.RoomConnection.incGuestsCount(roomId);
  }

  async onUserJoin(roomId: string, connectionId: string, userId: string) {
    const cCount = await this.GG.API.Connection.getCCountUserRoom(roomId, userId);
  
    await this.GG.API.Connection.incCCountUserRoom(roomId, userId);
  
    if (cCount > 0) {
      return this.onUserJoinAgain(roomId, connectionId, userId);
    } else {
      return this.onUserJoinFirst(roomId, connectionId, userId);
    }
  }

  async onUserJoinAgain(roomId: string, connectionId: string, userId: string) {

  }

  async onUserJoinFirst(roomId: string, connectionId: string, userId: string) {
    return this.GG.API.RoomConnection.incUsersCount(roomId);
  }

  async onLeave(roomId: string, connectionId: string) {
    const connection = await this.GG.API.Connection.getOne(connectionId);
  
    if (!connection) {
      throw new Error('Connection not found');
    }

    const { userId } = connection;
  
    const isNotExist = await this.GG.API.RoomConnection.del(roomId, connectionId);
    
    if (!isNotExist) {
      return false;
    }
  
    await this.GG.API.Connection.setRoomId(connectionId, null);
  
    if (userId) {
      return this.onUserLeave(roomId, connectionId, userId);
    } else {
      return this.onGuestLeave(roomId, connectionId);
    }
  }

  async onGuestLeave(roomId: string, connectionId: string) {
    return this.GG.API.RoomConnection.decGuestsCount(roomId);
  }

  async onUserLeave(roomId: string, connectionId: string, userId: string) {
    const cCount = await this.GG.API.Connection.getCCountUserRoom(roomId, userId);
  
    await this.GG.API.Connection.decCCountUserRoom(roomId, userId);
  
    if (cCount > 1) {
      return this.onUserLeaveSome(roomId, connectionId, userId);
    } else {
      return this.onUserLeaveLast(roomId, connectionId, userId);
    }
  }

  async onUserLeaveSome(roomId: string, connectionId: string, userId: string) {
   
  }

  async onUserLeaveLast(roomId: string, connectionId: string, userId: string) {
    this.GG.API.RoomConnection.decUsersCount(roomId);
  }

  async onLogin(roomId: string, connectionId: string, userId: string) {
    await this.onGuestLeave(roomId, connectionId);
    return this.onUserJoin(roomId, connectionId, userId);
  }

  async onLogout(roomId: string, connectionId: string, userId: string) {    
    await this.onUserLeave(roomId, connectionId, userId);
    return this.onGuestJoin(roomId, connectionId);
  }

  async onConnectionsCountChanged(roomId: string) {
    const counts = await this.GG.API.RoomConnection.getCount(roomId);
    
    const payload = {
      connectionsCountChanged: counts,
      roomId
    };
    
    this.GG.pubsub.publish('connectionsCountChanged', payload);
  }
}