import { RoomUser } from 'app/api/room/RoomUser';

export class RoomRoleClass {
    
  async set(roleData) {
    const { userId, roomId } = roleData;

    const data = await RoomUser.getPure(userId, roomId);

    if (data) {
      if (data.role == roleData.role) return true;

      return RoomUser.update(data.id, {
        role: roleData.role,
        lastRole: data.role
      });
    }

    return RoomUser.create(roleData);
  }
  
}

export const RoomRole = new RoomRoleClass();