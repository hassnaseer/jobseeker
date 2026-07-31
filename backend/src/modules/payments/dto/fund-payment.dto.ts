import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FundPaymentDto {
  @ApiProperty({
    required: false,
    description:
      'A Stripe PaymentMethod id collected client-side. Falls back to a test card outside production.',
  })
  @IsOptional()
  @IsString()
  paymentMethodId?: string;
}
