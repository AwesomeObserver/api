import {
  Entity,
  PrimaryGeneratedColumn, 
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne
} from "typeorm";
import { Room } from './Room';
import { User } from "./User";
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

  @Column({ type: 'integer', nullable: true })
  userId: number;

  @OneToOne(type => User)
  @JoinColumn()
  user: User;

  @OneToOne(type => Source)
  @JoinColumn()
  source: Source;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastPlay: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  createDate: string;

  @Column({ type: 'integer', default: 0 })
  plays: number;
}