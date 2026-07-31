import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { NotificationEventType } from '@/modules/notifications/enums/notification-event-type.enum';
import { User } from '@/modules/users/entities/user.entity';

/** Spec §19.29 — per-user, per-event-type channel toggles. */
@Entity('notification_preferences')
@Unique(['userId', 'eventType'])
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'event_type', type: 'enum', enum: NotificationEventType })
  eventType: NotificationEventType;

  @Column({ name: 'email_enabled' })
  emailEnabled: boolean;

  @Column({ name: 'in_app_enabled' })
  inAppEnabled: boolean;

  @Column({ name: 'push_enabled' })
  pushEnabled: boolean;
}
