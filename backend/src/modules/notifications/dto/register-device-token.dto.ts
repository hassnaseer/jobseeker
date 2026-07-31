import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MinLength } from 'class-validator';
import { DevicePlatform } from '@/modules/notifications/enums/device-platform.enum';

export class RegisterDeviceTokenDto {
  @ApiProperty()
  @IsString()
  @MinLength(10)
  token: string;

  @ApiProperty({ enum: DevicePlatform })
  @IsEnum(DevicePlatform)
  platform: DevicePlatform;
}
