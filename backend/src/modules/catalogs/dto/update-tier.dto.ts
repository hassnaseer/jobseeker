import { PartialType } from '@nestjs/swagger';
import { CreateTierDto } from '@/modules/catalogs/dto/create-tier.dto';

export class UpdateTierDto extends PartialType(CreateTierDto) {}
