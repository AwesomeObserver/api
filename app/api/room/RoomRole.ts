export default class {
  
    GG: any;
  
    constructor(GG) {
      this.GG = GG;
    }
  
    get() {
      
    }
  
    async set(roleData) {
      const { userId, roomId } = roleData;

      let userRepository = this.GG.DB.TO.getRepository(this.GG.Entity.RoomUser);
      let data = await userRepository.findOne({ userId, roomId });

      if (data) {
        if (data.role == roleData.role) {
          return true;
        }
  
        return userRepository.updateById(data.id, {
          role: roleData.role,
          lastRole: data.role
        });
      } else {
        let roomUser = new this.GG.Entity.RoomUser();
        roomUser.roomId = roomId;
        roomUser.userId = userId;
        roomUser.role = roleData.role;
        roomUser.whoSetRoleId = roleData.whoSetRoleId;
        return userRepository.save(roomUser);
      }
    }
    
  }