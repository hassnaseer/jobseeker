import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { decimalTransformer } from '@/common/transformers/decimal.transformer';
import { ProjectCatalog } from '@/modules/catalogs/entities/project-catalog.entity';

/** Spec §19.20 — one pricing tier (e.g. Basic/Standard/Premium) within a catalog. */
@Entity('catalog_tiers')
export class CatalogTier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'catalog_id' })
  @Index()
  catalogId: string;

  @ManyToOne(() => ProjectCatalog, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'catalog_id' })
  catalog: ProjectCatalog;

  @Column()
  name: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, transformer: decimalTransformer })
  price: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ name: 'delivery_days', type: 'int' })
  deliveryDays: number;

  @Column({ type: 'int', default: 0 })
  revisions: number;

  @Column({ type: 'text', array: true, default: '{}' })
  features: string[];
}
