import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Source {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  title: string;
  
  @Column({ type: 'varchar', nullable: true })
  cover: string

  @Column({ type: 'varchar' })
  service: string

  @Column({ type: 'integer' })
  duration: number

  @Column({ type: 'varchar' })
  serviceId: string

  @Column({ type: 'varchar' })
  url: string
}