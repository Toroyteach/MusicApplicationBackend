import { Module } from '@nestjs/common';
import { MusicService } from './music.service';
import { MusicController } from './music.controller';
import { HttpModule } from '@nestjs/axios';
import { FirebaseService } from 'src/firebase/firebase.service';

@Module({
  imports: [HttpModule],
  controllers: [MusicController],
  providers: [MusicService, FirebaseService]
})
export class MusicModule {}
