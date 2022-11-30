import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { FirebaseService } from 'src/firebase/firebase.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, FirebaseService]
})
export class AdminModule {}
