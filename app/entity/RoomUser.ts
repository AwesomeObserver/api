import {
  Entity,
  PrimaryGeneratedColumn, 
  Column,
  OneToOne,
  JoinColumn
} from "typeorm";
import { User } from "./User";
import { Room } from "./Room";

@Entity()
export class RoomUser {
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

  @Column({ type: 'boolean', default: false })
  follower: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  firstFollowDate: string;
  
  @Column({ type: 'timestamp with time zone', nullable: true })
  lastFollowDate: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastUnfollowDate: string;
  
  @Column({ type: 'varchar', default: 'user' })
  role: string;

  @Column({ type: 'integer', nullable: true })
  whoSetRoleId: number;

  @Column({ type: 'varchar', default: 'user' })
  lastRole: string;

  @Column({ type: 'boolean', default: false })
  banned: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  banDate: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  unbanDate: string;

  @Column({ type: 'integer', nullable: true })
  whoSetBanId: number;

  @Column({ type: 'text', nullable: true })
  banReason: string;
}