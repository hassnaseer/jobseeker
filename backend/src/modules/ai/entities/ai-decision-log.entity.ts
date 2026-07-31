import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { AiAutonomyLevel } from '@/modules/ai/enums/ai-autonomy-level.enum';
import { AiDecisionActor } from '@/modules/ai/enums/ai-decision-actor.enum';

/** Spec §21.5/§21.4/§21.6 — every AI-driven decision, logged for bias-audit + compliance. */
@Entity('ai_decision_logs')
export class AIDecisionLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AiDecisionActor })
  actor: AiDecisionActor;

  @Column({ name: 'autonomy_level', type: 'enum', enum: AiAutonomyLevel })
  autonomyLevel: AiAutonomyLevel;

  @Column({ name: 'entity_type' })
  @Index()
  entityType: string;

  @Column({ name: 'entity_id' })
  @Index()
  entityId: string;

  @Column()
  decision: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  reasons: string[];

  @Column({ name: 'confirmed_by', type: 'uuid', nullable: true })
  confirmedBy: string | null;

  @Column({ name: 'model_version' })
  modelVersion: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
