import {
  Entity,
  PrimaryGeneratedColumn, 
  Column,
  OneToOne,
  JoinColumn
} from "typeorm";
import { Room } from './Room';
import { Source } from './Source';

@Entity()
export class RoomSource {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  roomId: number;
  
  @OneToOne(type => Room)
  @JoinColumn()
  room: Room;

  @Column({ type: 'integer' })
  sourceId: number;

  @OneToOne(type => Source)
  @JoinColumn()
  source: Source;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastPlay: string;

  @Column({ type: 'integer', default: 0 })
  plays: number;
}