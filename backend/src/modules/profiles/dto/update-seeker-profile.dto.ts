import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  CertificationItemDto,
  EducationItemDto,
  PortfolioItemDto,
  WorkHistoryItemDto,
} from '@/modules/profiles/dto/seeker-profile-items.dto';
import { ExperienceLevel } from '@/common/enums/experience-level.enum';
import { SeekerAvailability } from '@/modules/profiles/enums/availability.enum';

export class UpdateSeekerProfileDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty()
  @IsString()
  @MaxLength(5000)
  bio: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  skills?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiProperty({ enum: ExperienceLevel, required: false })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  languages?: string[];

  @ApiProperty({ type: [EducationItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EducationItemDto)
  education?: EducationItemDto[];

  @ApiProperty({ type: [WorkHistoryItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkHistoryItemDto)
  workHistory?: WorkHistoryItemDto[];

  @ApiProperty({ type: [PortfolioItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PortfolioItemDto)
  portfolio?: PortfolioItemDto[];

  @ApiProperty({ type: [CertificationItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificationItemDto)
  certifications?: CertificationItemDto[];

  @ApiProperty({ enum: SeekerAvailability, required: false })
  @IsOptional()
  @IsEnum(SeekerAvailability)
  availability?: SeekerAvailability;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  maxConcurrentContracts?: number;
}
