import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PayoutMethodType } from '@/modules/payments/enums/payout-method-type.enum';

export class CreatePayoutMethodDto {
  @ApiProperty({ enum: PayoutMethodType })
  @IsEnum(PayoutMethodType)
  type: PayoutMethodType;

  @ApiProperty({ required: false, description: 'BANK only' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  bankName?: string;

  @ApiProperty({ required: false, description: 'BANK only' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  accountHolder?: string;

  @ApiProperty({ required: false, description: 'BANK only' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  accountNumber?: string;

  @ApiProperty({ required: false, description: 'BANK only' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  swiftOrRouting?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
