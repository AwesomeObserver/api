import { Entity, PrimaryColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";
import { Room } from "./Room";

@Entity()
export class Connection {
  @PrimaryColumn({ type: 'varchar', unique: true })
  id: string;

  @Column({ type: 'varchar' })
  instanceId: string;
  
  @Column({ type: 'integer', nullable: true })
  userId: number;

  @ManyToOne(type => User, user => user.userRooms, { cascadeAll: true })
  user: User;

  @Column({ type: 'integer', nullable: true })
  roomId: number;

  @ManyToOne(type => Room, room => room.users, { cascadeAll: true })
  room: Room;
}