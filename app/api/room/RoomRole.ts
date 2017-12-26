import { pubSub } from 'core/pubsub';
import { roomUserAPI } from 'app/api';

export class RoomRoleAPI {
    
  async set(roleData) {
    const { userId, roomId } = roleData;

    const data = await roomUserAPI.getPure(userId, roomId);

    if (data) {
      if (data.role == roleData.role) return true;

      const res = await roomUserAPI.update(data.id, {
        role: roleData.role,
        lastRole: data.role
      });

      // pubSub.publish('userRoleRoomChanged', {
      //   userRoleRoomChanged: {
      //     userId,
      //     role: roleData.role
      //   },
      //   roomId
      // });

      return res;
    }

    const res = await roomUserAPI.create(roleData);

    // pubSub.publish('userRoleRoomChanged', {
    //   userRoleRoomChanged: {
    //     userId,
    //     role: roleData.role
    //   },
    //   roomId
    // });

    return res;
  }
  
}