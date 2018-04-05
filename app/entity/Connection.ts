import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Connection {
	@PrimaryGeneratedColumn() id: number;

	@Column({ type: 'varchar', unique: true })
	connectionId: string;

	@Column({ type: 'varchar' })
	instanceId: string;

	@Column({ type: 'integer', nullable: true })
	userId: number;

	@Column({ type: 'integer', nullable: true })
	roomId: number;
}
