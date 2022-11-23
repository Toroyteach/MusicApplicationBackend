import { Module, RequestMethod, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth/auth.module';
import { FirebaseService } from './firebase/firebase.service';
import { ConfigModule } from '@nestjs/config';
import { ProfileModule } from './modules/profile/profile/profile.module';
import { ProfileController } from './modules/profile/profile/profile.controller';
import { isAuthenticated } from './app.middleware';
import { ProfileService } from './modules/profile/profile/profile.service';
import { JwtService } from '@nestjs/jwt';
import { JwtModule } from '@nestjs/jwt';
import { secret } from './utils/constants';
import { MusicModule } from './modules/music/music.module';
import { ChatsModule } from './modules/chats/chats.module';
import { CommentsModule } from './modules/comments/comments.module';

@Module({
  imports: [AuthModule, ProfileModule, ConfigModule.forRoot({ isGlobal: true }), ProfileModule, JwtModule.register({secret, signOptions: { expiresIn: '2h'}}), MusicModule, ChatsModule, CommentsModule],
  controllers: [AppController, ProfileController],
  providers: [AppService, FirebaseService, ProfileService, JwtService],
})
export class AppModule {

  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(isAuthenticated)
  //     .forRoutes(ProfileController);
  // }

}
