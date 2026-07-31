import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { SavedTargetType } from '@/modules/saved-items/enums/saved-target-type.enum';

export class SaveItemDto {
  @ApiProperty({ enum: SavedTargetType })
  @IsEnum(SavedTargetType)
  targetType: SavedTargetType;

  @ApiProperty()
  @IsUUID()
  targetId: string;
}
