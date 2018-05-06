import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Instance {
	@PrimaryGeneratedColumn() id: number;

	@Column({ type: 'varchar' })
	instanceId: string;

	@Column({ type: 'timestamp with time zone' })
	lastAlive: string;
}
