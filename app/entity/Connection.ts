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

  @Column({ type: 'integer', nullable: true })
  roomId: number;
}