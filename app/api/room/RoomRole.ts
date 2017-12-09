import { TypeORMConnect } from 'core/db';
import { RoomUser as RoomUserEntity } from 'app/entity/RoomUser';

export class RoomRoleClass {
    
  get() {
    
  }

  async set(roleData) {
    const { userId, roomId } = roleData;

    const TypeORM = await TypeORMConnect;
    let userRepository = TypeORM.getRepository(RoomUserEntity);
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
      let roomUser = new RoomUserEntity();
      roomUser.roomId = roomId;
      roomUser.userId = userId;
      roomUser.role = roleData.role;
      roomUser.whoSetRoleId = roleData.whoSetRoleId;
      return userRepository.save(roomUser);
    }
  }
  
}

export const RoomRole = new RoomRoleClass();