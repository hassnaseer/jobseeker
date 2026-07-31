import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateJobDto } from '@/modules/jobs/dto/create-job.dto';

export class UpdateJobDto extends PartialType(OmitType(CreateJobDto, ['publish'] as const)) {}
