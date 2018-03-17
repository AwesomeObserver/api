import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";
import { Room } from "./Room";

@Entity()
export class Connection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  connectionId: string;

  @Column({ type: 'varchar' })
  instanceId: string;
  
  @Column({ type: 'integer', nullable: true })
  userId: number;

  @Column({ type: 'integer', nullable: true })
  roomId: number;
}