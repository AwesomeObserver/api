import { PubSub } from 'core/pubsub';
import { RoomUser } from 'app/api/room/RoomUser';

export class RoomRoleClass {
    
  async set(roleData) {
    const { userId, roomId } = roleData;

    const data = await RoomUser.getPure(userId, roomId);

    if (data) {
      if (data.role == roleData.role) return true;

      const res = await RoomUser.update(data.id, {
        role: roleData.role,
        lastRole: data.role
      });

      // PubSub.publish('userRoleRoomChanged', {
      //   userRoleRoomChanged: {
      //     userId,
      //     role: roleData.role
      //   },
      //   roomId
      // });

      return res;
    }

    const res = await RoomUser.create(roleData);

    // PubSub.publish('userRoleRoomChanged', {
    //   userRoleRoomChanged: {
    //     userId,
    //     role: roleData.role
    //   },
    //   roomId
    // });

    return res;
  }
  
}

export const RoomRole = new RoomRoleClass();