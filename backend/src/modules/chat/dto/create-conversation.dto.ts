import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

/** Client-initiates-only (spec §6.2) — the seeker to message and which job it's about. */
export class CreateConversationDto {
  @ApiProperty()
  @IsUUID()
  jobId: string;

  @ApiProperty()
  @IsUUID()
  seekerId: string;
}
