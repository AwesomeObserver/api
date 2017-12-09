import { Connection } from 'app/api/connection/Connection';
import { RoomUser } from 'app/api/room/RoomUser';

export const schema = `
  userRoom(roomId: String!, userId: String): UserRoom
`;

export async function resolver(root, args, ctx) {
  let userId = args.userId;

  if (!userId) {
    userId = await Connection.getUserId(ctx.connectionId);
  }
  
  return await RoomUser.getOne(userId, args.roomId);
}