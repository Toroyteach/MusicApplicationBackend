import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { FirebaseService } from 'src/firebase/firebase.service';
import { JwtStrategy } from '../auth/auth/strategies/jwt.strategy';

@Module({
  controllers: [ChatsController],
  providers: [ChatsService, FirebaseService, JwtStrategy]
})
export class ChatsModule {}
