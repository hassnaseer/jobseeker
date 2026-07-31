import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '@/modules/categories/entities/category.entity';
import { CatalogStatus } from '@/modules/catalogs/enums/catalog-status.enum';
import { User } from '@/modules/users/entities/user.entity';

export interface CatalogFaqItem {
  question: string;
  answer: string;
}

/** Spec §8, §19.19 — seeker's productized service listing, ordered per tier into a fixed contract. */
@Entity('project_catalogs')
export class ProjectCatalog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'seeker_id' })
  @Index()
  seekerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seeker_id' })
  seeker: User;

  @Column()
  title: string;

  @Column({ name: 'category_id' })
  @Index()
  categoryId: string;

  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', array: true, default: '{}' })
  gallery: string[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  faq: CatalogFaqItem[];

  @Column({ type: 'enum', enum: CatalogStatus, default: CatalogStatus.DRAFT })
  @Index()
  status: CatalogStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
