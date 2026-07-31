import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateWithdrawalDto {
  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty()
  @IsString()
  @MaxLength(3)
  currency: string;

  @ApiProperty()
  @IsUUID()
  payoutMethodId: string;
}
