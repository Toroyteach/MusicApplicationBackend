import { Module, MiddlewareConsumer } from '@nestjs/common';
import { MusicService } from './music.service';
import { MusicController } from './music.controller';
import { HttpModule } from '@nestjs/axios';
import { FirebaseService } from 'src/firebase/firebase.service';
import { MusicMiddleware } from './middleware/music.middleware';

@Module({
  imports: [HttpModule],
  controllers: [MusicController],
  providers: [MusicService, FirebaseService]
})
export class MusicModule {

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MusicMiddleware)
      .forRoutes(MusicController);
  }
}
