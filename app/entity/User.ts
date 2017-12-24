import {
  Entity,
  PrimaryGeneratedColumn, 
  Column,
  OneToMany,
  JoinColumn
} from "typeorm";
import { RoomUser } from "./RoomUser";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  avatar: string;

  @Column({ type: 'varchar', default: 'user' })
  role: string;

  @Column({ type: 'boolean', default: false })
  banned: boolean;

  @Column({ type: 'varchar', nullable: true, unique: true })
  vkId: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  googleId: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  twitchId: string;

  @OneToMany(type => RoomUser, roomUser => roomUser.user)
  userRooms: RoomUser[];
}