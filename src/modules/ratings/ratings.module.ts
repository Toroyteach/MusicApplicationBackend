import { Module } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { FirebaseService } from 'src/firebase/firebase.service';
import { JwtStrategy } from '../auth/auth/strategies/jwt.strategy';

@Module({
  controllers: [RatingsController],
  providers: [RatingsService, FirebaseService, JwtStrategy]
})
export class RatingsModule {}
