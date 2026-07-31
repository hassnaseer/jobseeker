import { ApiProperty } from '@nestjs/swagger';
import {
  Equals,
  IsBoolean,
  IsEmail,
  IsIn,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export enum SignupRole {
  CLIENT = 'CLIENT',
  SEEKER = 'SEEKER',
  BOTH = 'BOTH',
}

export class SignupDto {
  @ApiProperty()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @ApiProperty()
  @IsString()
  confirmPassword: string;

  @ApiProperty({ enum: SignupRole })
  @IsIn(Object.values(SignupRole))
  role: SignupRole;

  @ApiProperty({ description: 'Version of the Terms of Service being accepted, e.g. "1.0"' })
  @IsString()
  tosVersion: string;

  @ApiProperty()
  @IsBoolean()
  @Equals(true, { message: 'You must accept the Terms of Service to sign up' })
  tosAccepted: boolean;
}
