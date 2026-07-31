import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { SavedTargetType } from '@/modules/saved-items/enums/saved-target-type.enum';
import { User } from '@/modules/users/entities/user.entity';

/** Spec §9, §19.21 — seekers save jobs, clients save (shortlist) seeker talent. */
@Entity('saved_items')
@Unique(['userId', 'targetType', 'targetId'])
export class SavedItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'target_type', type: 'enum', enum: SavedTargetType })
  targetType: SavedTargetType;

  @Column({ name: 'target_id' })
  @Index()
  targetId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
