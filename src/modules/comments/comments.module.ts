import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { FirebaseService } from 'src/firebase/firebase.service';
import { JwtStrategy } from '../auth/auth/strategies/jwt.strategy';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, FirebaseService, JwtStrategy]
})
export class CommentsModule {}
