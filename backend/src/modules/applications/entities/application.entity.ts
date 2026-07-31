import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { decimalTransformer } from '@/common/transformers/decimal.transformer';
import { ApplicationSource } from '@/modules/applications/enums/application-source.enum';
import { ApplicationStatus } from '@/modules/applications/enums/application-status.enum';
import { JobDuration } from '@/modules/jobs/enums/job-duration.enum';
import { Job } from '@/modules/jobs/entities/job.entity';
import { User } from '@/modules/users/entities/user.entity';

/** Spec §19.9/§6. */
@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'job_id' })
  @Index()
  jobId: string;

  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column({ name: 'seeker_id' })
  @Index()
  seekerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seeker_id' })
  seeker: User;

  @Column({ name: 'cover_letter', type: 'text' })
  coverLetter: string;

  @Column({
    name: 'bid_amount',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  bidAmount: number | null;

  @Column({
    name: 'proposed_hourly_rate',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  proposedHourlyRate: number | null;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ name: 'estimated_duration', type: 'enum', enum: JobDuration, nullable: true })
  estimatedDuration: JobDuration | null;

  @Column({ type: 'text', array: true, default: '{}' })
  attachments: string[];

  @Column({ type: 'enum', enum: ApplicationSource, default: ApplicationSource.JOB_PAGE })
  source: ApplicationSource;

  @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.PENDING })
  @Index()
  status: ApplicationStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
