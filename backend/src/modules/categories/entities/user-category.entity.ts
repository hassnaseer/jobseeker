import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { UserRole } from '@/common/enums/user-role.enum';
import { Category } from '@/modules/categories/entities/category.entity';
import { User } from '@/modules/users/entities/user.entity';

/**
 * A user's category selection, scoped per role: a dual-role account can
 * hold different categories as a client than as a seeker.
 */
@Entity('user_categories')
@Unique(['userId', 'role', 'categoryId'])
export class UserCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ name: 'category_id' })
  @Index()
  categoryId: string;

  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
