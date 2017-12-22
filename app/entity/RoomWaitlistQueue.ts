import {
  Entity,
  PrimaryGeneratedColumn, 
  Column,
  OneToOne,
  JoinColumn
} from "typeorm";
import { Room } from "./Room";
import { User } from "./User";

@Entity()
export class RoomWaitlistQueue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', unique: true })
  roomId: number;

  @OneToOne(type => Room)
  @JoinColumn()
  room: Room;

  @Column({ type: 'integer', nullable: true })
  userId: number;

  @OneToOne(type => User)
  @JoinColumn()
  user: User;

  @Column({ type: 'timestamp with time zone', nullable: true })
  start: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  end: string;

  @Column("simple-array")
  users: number[];
}