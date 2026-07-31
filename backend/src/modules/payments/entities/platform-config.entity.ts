import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { decimalTransformer } from '@/common/transformers/decimal.transformer';
import { AiAutonomyLevel } from '@/modules/ai/enums/ai-autonomy-level.enum';

/** Spec §19.33. Singleton table — always exactly one row, id='default'. */
@Entity('platform_config')
export class PlatformConfig {
  @PrimaryColumn({ default: 'default' })
  id: string;

  @Column({
    name: 'client_commission_pct',
    type: 'numeric',
    precision: 5,
    scale: 4,
    default: 0.1,
    transformer: decimalTransformer,
  })
  clientCommissionPct: number;

  @Column({
    name: 'seeker_commission_pct',
    type: 'numeric',
    precision: 5,
    scale: 4,
    default: 0.1,
    transformer: decimalTransformer,
  })
  seekerCommissionPct: number;

  @Column({ name: 'auto_approve_hours_days', type: 'int', default: 7 })
  autoApproveHoursDays: number;

  @Column({ name: 'escrow_auto_release_days', type: 'int', default: 14 })
  escrowAutoReleaseDays: number;

  @Column({
    name: 'min_withdrawal',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 20,
    transformer: decimalTransformer,
  })
  minWithdrawal: number;

  @Column({ name: 'supported_currencies', type: 'text', array: true, default: '{USD}' })
  supportedCurrencies: string[];

  @Column({ name: 'base_currency', default: 'USD' })
  baseCurrency: string;

  @Column({
    name: 'featured_job_price',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  featuredJobPrice: number;

  /** Spec §21.5 — AI recruiter config; defaults keep a human confirming every hire/reject. */
  @Column({
    name: 'ai_autonomy_level',
    type: 'enum',
    enum: AiAutonomyLevel,
    default: AiAutonomyLevel.SHORTLIST,
  })
  aiAutonomyLevel: AiAutonomyLevel;

  @Column({ name: 'ai_provider', type: 'varchar', nullable: true })
  aiProvider: string | null;

  @Column({ name: 'ai_model', type: 'varchar', nullable: true })
  aiModel: string | null;

  @Column({
    name: 'ai_monthly_spend_cap',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  aiMonthlySpendCap: number | null;

  @Column({ name: 'ai_enabled_features', type: 'text', array: true, default: '{}' })
  aiEnabledFeatures: string[];

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
