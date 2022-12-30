import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { FirebaseService } from 'src/firebase/firebase.service';
import { AuthService } from 'src/modules/auth/auth/auth.service';
import { JwtStrategy } from 'src/modules/auth/auth/strategies/jwt.strategy';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [MulterModule.register({
    dest: './users/profileImages',
  })],
  controllers: [ProfileController],
  providers: [ProfileService, FirebaseService, JwtStrategy]
})
export class ProfileModule {}
