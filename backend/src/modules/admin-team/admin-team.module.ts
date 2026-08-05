import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminTeamController } from '@/modules/admin-team/admin-team.controller';
import { AdminTeamService } from '@/modules/admin-team/admin-team.service';
import { AdminTeamMember } from '@/modules/admin-team/entities/admin-team-member.entity';
import { AdminPermissionGuard } from '@/modules/admin-team/guards/admin-permission.guard';
import { MailModule } from '@/modules/mail/mail.module';
import { UsersModule } from '@/modules/users/users.module';

/**
 * Global so AdminPermissionGuard/AdminTeamService can be used from other
 * feature modules (profiles, disputes, categories) without each importing
 * this module and risking a circular dependency back to them.
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AdminTeamMember]), UsersModule, MailModule],
  controllers: [AdminTeamController],
  providers: [AdminTeamService, AdminPermissionGuard],
  exports: [AdminTeamService, AdminPermissionGuard],
})
export class AdminTeamModule {}
