import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { FirebaseService } from 'src/firebase/firebase.service';
import { CommentsMiddleware } from './middleware/comments.middleware';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, FirebaseService]
})
export class CommentsModule {

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CommentsMiddleware)
      .forRoutes({ path: 'comments', method: RequestMethod.POST });
  }

}
