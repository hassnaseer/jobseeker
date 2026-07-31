import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from '@/modules/applications/entities/application.entity';
import { ContractsController } from '@/modules/contracts/contracts.controller';
import { ContractsService } from '@/modules/contracts/contracts.service';
import { Contract } from '@/modules/contracts/entities/contract.entity';
import { Deliverable } from '@/modules/contracts/entities/deliverable.entity';
import { Milestone } from '@/modules/contracts/entities/milestone.entity';
import { Job } from '@/modules/jobs/entities/job.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contract, Milestone, Deliverable, Application, Job])],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}
