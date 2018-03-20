import { getManager, getRepository } from "typeorm";
import { broker } from 'core/broker';
import { logger } from 'core/logger';
import { pubSub } from 'core/pubsub';
import { Connection as ConnectionEntity } from 'app/entity/Connection';

export const setupConnectionService = () => {
  const repository = getRepository(ConnectionEntity);
  const manager = getManager();

  return broker.createService({
    name: "connection",
    events: {
      "connection.join"(ctx) {
        const { connectionId, instanceId } = ctx;
        return broker.call('connection.save', { connectionId, instanceId });
      },
      "connection.leave": async (ctx) => {
        const { connectionId } = ctx;
        let connection: any = await broker.call('connection.getOne', { connectionId });

        if (!connection) {
          logger.error('onLeave Error');
          return false;
        }

        const { roomId } = connection;

        if (roomId) {
          await broker.emit("connection.leaveRoom", { roomId, connectionId });
        }
        
        return broker.call('connection.del', { connectionId });
      },
      "connection.login": async (ctx) => {
        const { connectionId, userId } = ctx;
        let connection: any = await broker.call('connection.getOne', { connectionId });
        
        if (!connection) {
          logger.error('onLogin Error');
          return false;
        }

        await broker.call('connection.setUserId', { connectionId, userId });

        const { roomId } = connection;
      
        if (roomId) {
          await broker.call('connection.recalcRoomCount', { roomId });
        }
      
        return true;
      },
      "connection.joinRoom": async (ctx) => {
        const { connectionId, roomId } = ctx;
        const connection = await broker.call('connection.getOne', { connectionId });
  
        if (!connection) {
          throw new Error('Connection not found');
        }
      
        await broker.call('connection.setRoomId', { connectionId, roomId });
        return broker.call('connection.recalcRoomCount', { roomId });
      },
      "connection.leaveRoom": async (ctx) => {
        let { connectionId, roomId } = ctx;
        await broker.call('connection.setRoomId', { connectionId, roomId: null });
        return broker.call('connection.recalcRoomCount', { roomId });
      },
    },
    actions: {
      clearInstance: async (ctx) => {
        const { instanceId } = ctx.params;
        const instanceConnections = await repository.find({ instanceId });
        const roomsIds = new Map();
    
        instanceConnections.forEach(({ roomId }) => {
          if (roomId && !roomsIds.has(roomId)) {
            roomsIds.set(roomId, roomId);
            broker.call('connection.recalcRoomCount', { roomId });
          }
        });
    
        return repository.remove(instanceConnections);
      },
      recalcRoomCount: async (ctx) => {
        const roomId = parseInt(`${ctx.params.roomId}`, 10);
        const counts = await broker.call('connection.getRoomCounts', { roomId });
        pubSub.publish('connectionsCountChanged', counts, { roomId });
      },
      save: async (ctx) => {
        const { connectionId, instanceId } = ctx.params;
        let connection = new ConnectionEntity();
        connection.connectionId = connectionId;
        connection.instanceId = instanceId;
        return manager.save(connection);
      },
      del: async (ctx) => {
        const { connectionId } = ctx.params;
        const connection = await repository.findOne({ connectionId });
        return repository.remove(connection);
      },
      setRoomId: async (ctx) => {
        const { connectionId, roomId } = ctx.params;
        return repository.update({ connectionId }, { roomId });
      },
      setUserId: async (ctx) => {
        const { connectionId, userId } = ctx.params;
        return repository.update({ connectionId }, { userId });
      },
      getOne: async (ctx) => {
        const { connectionId } = ctx.params;
        return repository.findOne({ connectionId });
      },
      getRoomConnections: async (ctx) => {
        const { roomId } = ctx.params;
        return repository.find({ roomId });
      },
      getUserConnections: async (ctx) => {
        const { userId } = ctx.params;
        return repository.find({ userId });
      },
      getRoomCounts: async (ctx) => {
        const { roomId } = ctx.params;
        const connections: any = await broker.call('connection.getRoomConnections', { roomId });
        let users = new Map();
        let guestsCount = 0;
    
        connections.forEach(connection => {
          if (connection.userId) {
            users.set(connection.userId, 1);
          } else {
            guestsCount++;
          }
        });
    
        const usersCount = users.size;
    
        return { 
          connectionsCount: usersCount + guestsCount, 
          usersCount, 
          guestsCount, 
        };  
      }
    }
  });
}