import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ReportStatus } from '@/modules/chat/enums/report-status.enum';
import { ReportTargetType } from '@/modules/chat/enums/report-target-type.enum';
import { User } from '@/modules/users/entities/user.entity';

/**
 * Spec §19.31, scoped to chat targets (MESSAGE/CONVERSATION) for now
 * since chat is the only module that needs "report" today; the admin
 * module will build the SA review queue and can extend target_type to
 * JOB/PROFILE/REVIEW without touching this table's shape.
 */
@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'reporter_id' })
  @Index()
  reporterId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @Column({ name: 'target_type', type: 'enum', enum: ReportTargetType })
  targetType: ReportTargetType;

  @Column({ name: 'target_id' })
  @Index()
  targetId: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.OPEN })
  status: ReportStatus;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
