import { PartialType } from '@nestjs/swagger';
import { CreateCatalogDto } from '@/modules/catalogs/dto/create-catalog.dto';

export class UpdateCatalogDto extends PartialType(CreateCatalogDto) {}
