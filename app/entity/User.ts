import {
  Entity,
  PrimaryGeneratedColumn, 
  Column,
  OneToMany
} from "typeorm";
import { UserSocial } from "./UserSocial";
import { RoomUser } from "./RoomUser";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  avatar: string;

  @Column({ type: 'varchar', default: 'user' })
  role: string;

  @Column({ type: 'boolean', default: false })
  banned: boolean;

  @OneToMany(type => RoomUser, roomUser => roomUser.user)
  userRooms: RoomUser[];

  @OneToMany(type => UserSocial, social => social.user)
  social: UserSocial[];
}