import { Module, RequestMethod, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth/auth.module';
import { FirebaseService } from './firebase/firebase.service';
import { ConfigModule } from '@nestjs/config';
import { ProfileModule } from './modules/profile/profile/profile.module';
import { ProfileController } from './modules/profile/profile/profile.controller';
import { CommentsController } from './modules/comments/comments.controller';
import { AppSettingsMiddleware } from './utils/appSettings.middleware';
import { ProfileService } from './modules/profile/profile/profile.service';
import { JwtService } from '@nestjs/jwt';
import { JwtModule } from '@nestjs/jwt';
import { secret } from './utils/constants';
import { MusicModule } from './modules/music/music.module';
import { ChatsModule } from './modules/chats/chats.module';
import { CommentsModule } from './modules/comments/comments.module';
import { AdminModule } from './modules/profile/admin/admin.module';
import { NotificationModule } from './modules/notification/notification.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { MusicController } from './modules/music/music.controller';

@Module({
  imports: [ JwtModule.register({ secret, signOptions: { expiresIn: '2h' } }), ConfigModule.forRoot({ isGlobal: true }), 
  AuthModule, ProfileModule, ProfileModule, MusicModule, ChatsModule, CommentsModule, AdminModule, NotificationModule, RatingsModule, FeedbackModule, GatewayModule],
  //controllers: [AppController, ProfileController],
  //providers: [AppService, FirebaseService, ProfileService, JwtService],
})
export class AppModule {

  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(AppSettingsMiddleware)
  //     .forRoutes(MusicController);
  // }

}
