import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Source {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  title: string;
  
}