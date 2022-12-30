import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { JwtAuthGuard } from '../auth/auth/guards/jtw-auth.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from './utils/feedbackFiles.util';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('fileImage', {
      storage: diskStorage({
        destination: './users/feedbackImages',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  create(@UploadedFile() file, @Body() createFeedbackDto: CreateFeedbackDto) {

    const response = {
      originalname: file.originalname,
      filename: file.filename,
    };

    createFeedbackDto.photoId = response.filename

    return this.feedbackService.create(createFeedbackDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.feedbackService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('image/:id')
  getFeedbackImages(@Param('id') id: string, @Res() res) {

    return res.sendFile(id, { root: './users/feedbackImages/' });
  }
}
