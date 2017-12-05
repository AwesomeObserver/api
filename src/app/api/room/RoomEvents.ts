export default class {
  GG: any;

  constructor(GG) {
    this.GG = GG;
  }

  async onJoin(roomId: string, connectionId: string) {
    const connection = await this.GG.API.Connection.getOne(connectionId);
  
    if (!connection) {
      throw new Error('[joinRoom] Connection not found');
    }
  
    // Если это соединение уже в комнате
    // if (!await RoomUserRedisAPI.saveConnection(connectionId, roomId)) {
    //   return false;
    // }
  
    // await ConnectionAPI.setConnectionRoomId(connectionId, roomId);
  
    // if (userId) {
    //   return onUserJoinRoom(roomId, connectionId, userId);
    // } else {
    //   return onGuestJoinRoom(roomId, connectionId);
    // }
  }
}