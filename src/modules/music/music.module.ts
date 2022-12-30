import { Module, MiddlewareConsumer } from '@nestjs/common';
import { MusicService } from './music.service';
import { MusicController } from './music.controller';
import { HttpModule } from '@nestjs/axios';
import { FirebaseService } from 'src/firebase/firebase.service';
import { MusicMiddleware } from './middleware/music.middleware';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [HttpModule, MulterModule.register({
    dest: './users/generatedImages',
  })],
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
