import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddScreenshotDto {
  @ApiProperty()
  @IsString()
  url: string;
}
