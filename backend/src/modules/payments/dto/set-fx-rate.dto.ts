import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, MaxLength, Min } from 'class-validator';

export class SetFxRateDto {
  @ApiProperty()
  @IsString()
  @MaxLength(3)
  baseCurrency: string;

  @ApiProperty()
  @IsString()
  @MaxLength(3)
  quoteCurrency: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  rate: number;
}
