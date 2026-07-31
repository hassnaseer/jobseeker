import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AiSuggestionType } from '@/modules/ai/enums/ai-suggestion-type.enum';
import { User } from '@/modules/users/entities/user.entity';

/** Spec §21.5 — one row per AI-assist call (ASSIST-level suggestions, proposal/job-post drafts, etc). */
@Entity('ai_suggestions')
export class AISuggestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: AiSuggestionType })
  @Index()
  type: AiSuggestionType;

  @Column({ type: 'jsonb' })
  input: Record<string, unknown>;

  @Column({ type: 'jsonb' })
  output: Record<string, unknown>;

  @Column({ name: 'model_version' })
  modelVersion: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
