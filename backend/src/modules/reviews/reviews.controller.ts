import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CreateReviewDto } from '@/modules/reviews/dto/create-review.dto';
import { EditReviewDto } from '@/modules/reviews/dto/edit-review.dto';
import { ReportReviewDto } from '@/modules/reviews/dto/report-review.dto';
import { ReviewsService } from '@/modules/reviews/reviews.service';
import { User } from '@/modules/users/entities/user.entity';

@ApiTags('reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('contracts/:contractId/reviews')
  create(
    @CurrentUser() user: User,
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(user, contractId, dto);
  }

  @Get('contracts/:contractId/reviews')
  listForContract(@Param('contractId', ParseUUIDPipe) contractId: string) {
    return this.reviewsService.listForContract(contractId);
  }

  @Patch('reviews/:id')
  edit(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EditReviewDto,
  ) {
    return this.reviewsService.edit(user, id, dto);
  }

  @Get('reviews/mine')
  mine(@CurrentUser() user: User) {
    return this.reviewsService.listGivenByMe(user);
  }

  @Get('users/:userId/reviews')
  receivedBy(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.reviewsService.listReceivedBy(userId);
  }

  @Post('reviews/:id/report')
  report(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReportReviewDto,
  ) {
    return this.reviewsService.report(user, id, dto);
  }
}
