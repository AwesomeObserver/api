import { Connection } from 'app/api/connection/Connection';
import { RoomUser } from 'app/api/room/RoomUser';

export const schema = `
  userRoom(roomId: Int!, userId: Int): UserRoom
`;

export async function resolver(
  root: any,
  args: {
    roomId: number,
    userId?: number
  },
  ctx: any
) {
  let userId = args.userId;

  if (!userId) {
    userId = await Connection.getUserId(ctx.connectionId);
  }
  
  return await RoomUser.getOne(userId, args.roomId);
}