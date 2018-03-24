import { format } from 'date-fns';
import { broker } from 'core/broker';
import { getConnection } from "typeorm";
import { RoomSource as RoomSourceEntity } from 'app/entity/RoomSource';
import { sourceAPI, roomModeWaitlistAPI } from 'app/api';

export class RoomCollectionAPI {

  get repository() {
    return getConnection().getRepository(RoomSourceEntity);
  }

  get manager() {
    return getConnection().manager;
  }

  getBotData = () => {
    return  {
      id: 0,
      name: 'Collection Bot'
    };
  }

  start = async (roomId: number) => {
    return roomModeWaitlistAPI.add(roomId, 0);
  }

  getNext = async (roomId: number) => {
    const roomSource = await this.repository.findOne({
      where: { roomId },
      relations: ["source"],
      order: {
        "lastPlay": "ASC"
      }
    });

    if (!roomSource) {
      return null;
    }

    this.repository.updateById(roomSource.id, {
      plays: roomSource.plays + 1,
      lastPlay: format(+new Date())
    });

    return roomSource;
  }

  get = async (roomId: number) => {
    return this.repository.find({
      where: { roomId },
      take: 100,
      relations: ["source"],
      order: {
        "id": "DESC"
      }
    });
  }

  getCount = async (roomId: number) => {
    return this.repository.count({ roomId });
  }

  addFromLink = async (roomId, userId, link, useTimecode) => {
    let { source, start } = await sourceAPI.addFromLink(link, useTimecode);

    const res = await this.addSource(roomId, source.id, userId);

    return this.repository.findOneById(res.id, { relations: ["source"] });
  }

  addSource = async (roomId: number, sourceId: number, userId) => {
    if (await this.repository.findOne({ roomId, sourceId })) {
      throw new Error('collectionDuplicateSource');
    }

    let roomSource = new RoomSourceEntity();
    roomSource.roomId = roomId;
    roomSource.userId = userId;
    roomSource.sourceId = sourceId;
    roomSource.lastPlay = format(+new Date(1995, 11, 17));
    roomSource.createDate = format(+new Date());

    const res = await this.repository.save(roomSource);
    const count = await this.getCount(roomId);
    
    await broker.call('room.update', {
      roomId,
      data: {
        collectionCount: count
      }
    });

    return res;
  }

  removeSource = async (roomId: number, roomSourceId: number) => {
    const roomSource = await this.repository.findOne({
      id: roomSourceId,
      roomId
    });

    const res = await this.repository.remove(roomSource);
    const count = await this.getCount(roomId);
    
    await broker.call('room.update', {
      roomId,
      data: {
        collectionCount: count
      }
    });

    return res;
  }
}