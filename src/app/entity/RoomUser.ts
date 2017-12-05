import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class RoomUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  userId: number;

  @Column({ type: 'integer' })
  roomId: number;

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

  @Column({ type: 'timestamp with time zone', nullable: true })
  banDate: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  unbanDate: string;

  @Column({ type: 'integer', nullable: true })
  whoSetBanId: number;

  @Column({ type: 'text', nullable: true })
  banReason: string;
}