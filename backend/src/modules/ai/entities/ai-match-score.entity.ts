import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { decimalTransformer } from '@/common/transformers/decimal.transformer';
import { Job } from '@/modules/jobs/entities/job.entity';
import { User } from '@/modules/users/entities/user.entity';

/** Spec §21.5 — precomputed seeker<->job fit score, cached so matching doesn't cost an LLM call per request. */
@Entity('ai_match_scores')
@Unique(['seekerId', 'jobId'])
export class AIMatchScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'seeker_id' })
  @Index()
  seekerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seeker_id' })
  seeker: User;

  @Column({ name: 'job_id' })
  @Index()
  jobId: string;

  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column({ type: 'numeric', precision: 5, scale: 2, transformer: decimalTransformer })
  score: number;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  reasons: string[];

  @Column({ name: 'model_version' })
  modelVersion: string;

  @Column({ name: 'computed_at', type: 'timestamptz' })
  computedAt: Date;
}
