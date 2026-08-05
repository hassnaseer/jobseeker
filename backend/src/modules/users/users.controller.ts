import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { diskStorage } from 'multer';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { User } from '@/modules/users/entities/user.entity';
import { UsersService } from '@/modules/users/users.service';

const AVATAR_DIR = join(process.cwd(), 'uploads', 'avatars');
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @ApiOkResponse({ description: 'The authenticated user, including per-role profile status.' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: User) {
    const roleProfileStatuses = await this.usersService.getRoleProfileStatuses(user.id);
    return { ...user, roleProfileStatuses };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          if (!existsSync(AVATAR_DIR)) mkdirSync(AVATAR_DIR, { recursive: true });
          cb(null, AVATAR_DIR);
        },
        filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname)}`),
      }),
      limits: { fileSize: MAX_AVATAR_SIZE_BYTES },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          cb(new BadRequestException('Avatar must be a JPEG, PNG, WEBP, or GIF image'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/avatars/${file.filename}`;
    await this.usersService.updateBasicInfo(user, { avatarUrl });
    return { avatarUrl };
  }
}
