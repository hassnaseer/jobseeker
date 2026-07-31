import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { decimalTransformer } from '@/common/transformers/decimal.transformer';

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

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
