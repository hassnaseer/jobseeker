import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class CatalogFaqItemDto {
  @ApiProperty()
  @IsString()
  @MaxLength(300)
  question: string;

  @ApiProperty()
  @IsString()
  @MaxLength(2000)
  answer: string;
}

export class CreateCatalogDto {
  @ApiProperty()
  @IsString()
  @MaxLength(150)
  title: string;

  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiProperty()
  @IsString()
  @MaxLength(5000)
  description: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  gallery?: string[];

  @ApiProperty({ type: [CatalogFaqItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => CatalogFaqItemDto)
  faq?: CatalogFaqItemDto[];
}
