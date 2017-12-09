import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'varchar' })
  title: string;

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
}