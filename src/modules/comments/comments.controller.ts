import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/auth/guards/jtw-auth.guard';

@Controller('comments')
export class CommentsController {

  constructor(private readonly commentsService: CommentsService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(createCommentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('allComments')
  findAll() {
    return this.commentsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('singleMix/:mixId')
  getMixComments(@Param('mixId') mixId: string) {
    return this.commentsService.getMixComments(mixId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('singleMixData/:mixId')
  getMixRatingsData(@Param('mixId') mixId: string) {
    return this.commentsService.getMixData(mixId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('usersComments')
  findUsersComents() {
    return this.commentsService.findUsersComments();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update')
  update(@Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(updateCommentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.commentsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('disable')
  disableComment(@Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.disableComment(updateCommentDto);
  }
}
