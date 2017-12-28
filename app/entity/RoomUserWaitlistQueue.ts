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
export class RoomUserWaitlistQueue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  userId: number;

  @OneToOne(type => User)
  @JoinColumn()
  user: User;

  @Column({ type: 'integer' })
  roomId: number;

  @OneToOne(type => Room)
  @JoinColumn()
  room: Room;

  @Column("simple-array")
  sources: string[];
}