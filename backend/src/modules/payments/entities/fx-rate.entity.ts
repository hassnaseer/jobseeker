import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { decimalTransformer } from '@/common/transformers/decimal.transformer';

/**
 * Spec §19.34. No live FX provider is wired in (no API key for one) —
 * rates are set by SA for now via the admin endpoint. A real feed can
 * replace that call site later without touching anything that reads
 * rates.
 */
@Entity('fx_rates')
@Unique(['baseCurrency', 'quoteCurrency'])
export class FxRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'base_currency' })
  baseCurrency: string;

  @Column({ name: 'quote_currency' })
  quoteCurrency: string;

  @Column({ type: 'numeric', precision: 18, scale: 8, transformer: decimalTransformer })
  rate: number;

  @CreateDateColumn({ name: 'fetched_at', type: 'timestamptz' })
  fetchedAt: Date;
}
