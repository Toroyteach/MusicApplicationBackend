import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { FirebaseService } from 'src/firebase/firebase.service';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [MulterModule.register({
    dest: './users/feedbackImages',
  })],
  controllers: [FeedbackController],
  providers: [FeedbackService, FirebaseService]
})
export class FeedbackModule { }
