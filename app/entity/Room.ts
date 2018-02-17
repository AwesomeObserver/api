import {
  Entity,
  PrimaryGeneratedColumn, 
  Column,
  OneToMany,
  JoinColumn
} from "typeorm";
import { RoomUser } from "./RoomUser";

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true, length: 32 })
  name: string;

  @Column({ type: 'varchar', length: 48 })
  title: string;

  @Column({ type: 'varchar', default: 'waitlist' })
  mode: string;

  @Column({ type: 'varchar', nullable: true })
  avatar: string;

  @Column({ type: 'boolean', default: false })
  banned: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  banDate: string;

  @Column({ type: 'integer', nullable: true })
  whoSetBanId: number;

  @Column({ type: 'text', nullable: true })
  banReason: string;

  @Column({ type: 'boolean', default: false })
  followerMode: boolean;

  @Column({ type: 'boolean', default: false })
  slowMode: boolean;

  @OneToMany(type => RoomUser, roomUser => roomUser.room)
  users: RoomUser[];
}