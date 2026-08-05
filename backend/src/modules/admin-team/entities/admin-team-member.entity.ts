import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AdminPermission } from '@/modules/admin-team/enums/admin-permission.enum';
import { User } from '@/modules/users/entities/user.entity';

export enum AdminTeamMemberStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
}

/**
 * A scoped sub-admin: SUPER_ADMIN access limited to the listed permission
 * areas. A SUPER_ADMIN account with no row here is the unscoped root admin
 * and always has full access — this table only ever narrows access.
 */
@Entity('admin_team_members')
export class AdminTeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  @Index()
  email: string;

  @Column({ name: 'user_id', nullable: true })
  @Index()
  userId: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ type: 'enum', enum: AdminPermission, array: true, default: [] })
  permissions: AdminPermission[];

  @Column({ type: 'enum', enum: AdminTeamMemberStatus, default: AdminTeamMemberStatus.PENDING })
  status: AdminTeamMemberStatus;

  @Column({ name: 'invited_by' })
  invitedBy: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
