import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { FirebaseService } from 'src/firebase/firebase.service';
import { AuthService } from 'src/modules/auth/auth/auth.service';
import { JwtStrategy } from 'src/modules/auth/auth/strategies/jwt.strategy';

@Module({
  imports: [],
  controllers: [ProfileController],
  providers: [ProfileService, FirebaseService, JwtStrategy]
})
export class ProfileModule {}
