import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

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

  @Column({ type: 'varchar', nullable: true, unique: true })
  vkId: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  googleId: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  twitchId: string;
}