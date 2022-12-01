import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { FirebaseService } from 'src/firebase/firebase.service';

@Module({
  controllers: [FeedbackController],
  providers: [FeedbackService, FirebaseService]
})
export class FeedbackModule {}
