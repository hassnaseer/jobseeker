import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from '@/modules/applications/entities/application.entity';
import { CatalogsController } from '@/modules/catalogs/catalogs.controller';
import { CatalogsService } from '@/modules/catalogs/catalogs.service';
import { CatalogTier } from '@/modules/catalogs/entities/catalog-tier.entity';
import { ProjectCatalog } from '@/modules/catalogs/entities/project-catalog.entity';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { ContractsModule } from '@/modules/contracts/contracts.module';
import { Job } from '@/modules/jobs/entities/job.entity';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectCatalog, CatalogTier, Job, Application]),
    CategoriesModule,
    ContractsModule,
    UsersModule,
  ],
  controllers: [CatalogsController],
  providers: [CatalogsService],
  exports: [CatalogsService],
})
export class CatalogsModule {}
