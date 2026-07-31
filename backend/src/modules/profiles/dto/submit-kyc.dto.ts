import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { DocumentType } from '@/modules/profiles/enums/document-type.enum';

export class SubmitKycDto {
  @ApiProperty({ enum: DocumentType })
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  documentNumber: string;

  @ApiProperty()
  @IsString()
  frontUrl: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  backUrl?: string;

  @ApiProperty()
  @IsString()
  selfieUrl: string;

  @ApiProperty({ description: 'ISO date, e.g. 1990-05-20' })
  @IsDateString()
  dob: string;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  addressLine1: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressLine2?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(20)
  postalCode: string;
}
