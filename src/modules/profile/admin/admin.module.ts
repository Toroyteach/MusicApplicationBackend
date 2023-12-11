import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { FirebaseService } from 'src/firebase/firebase.service';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  controllers: [AdminController],
  providers: [AdminService, FirebaseService],
  imports: [SharedModule]
})
export class AdminModule {}
