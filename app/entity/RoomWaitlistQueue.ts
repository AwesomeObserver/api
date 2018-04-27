import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToOne,
	JoinColumn
} from 'typeorm';
import { Room } from './Room';
import { User } from './User';
import { Source } from './Source';

@Entity()
export class RoomWaitlistQueue {
	@PrimaryGeneratedColumn() id: number;

	@Column({ type: 'integer', unique: true })
	roomId: number;

	@OneToOne((type) => Room)
	@JoinColumn()
	room: Room;

	@Column({ type: 'integer', nullable: true })
	userId: number;

	@OneToOne((type) => User)
	@JoinColumn()
	user: User;

	@Column({ type: 'integer', nullable: true })
	sourceId: number;

	@OneToOne((type) => Source)
	@JoinColumn()
	source: Source;

	@Column({ type: 'timestamp with time zone', nullable: true })
	start: string;

	@Column({ type: 'integer', default: 0 })
	sourceStart: number;

	@Column({ type: 'timestamp with time zone', nullable: true })
	end: string;

	@Column('simple-array', { default: '' })
	users: string[];
}
