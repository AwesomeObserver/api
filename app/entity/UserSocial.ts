import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { User } from './User';

@Entity()
export class UserSocial {
	@PrimaryGeneratedColumn() id: number;

	@Column({ type: 'integer' })
	userId: number;

	@ManyToOne((type) => User, (user) => user.userRooms)
	user: User;

	@Column({ type: 'varchar' })
	name: string;

	@Column({ type: 'varchar', nullable: true })
	avatar: string;

	@Column({ type: 'varchar', nullable: true })
	email: string;

	@Column({ type: 'varchar' })
	serviceName: string;

	@Column({ type: 'varchar', unique: true })
	serviceId: string;
}
