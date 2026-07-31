import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { MessageType } from '@/modules/chat/enums/message-type.enum';

export class SendMessageDto {
  @ApiProperty({
    required: false,
    description: 'Required for TEXT messages; optional caption for IMAGE/FILE',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  content?: string;

  @ApiProperty({ enum: MessageType, required: false, default: MessageType.TEXT })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  attachments?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  replyToId?: string;
}
