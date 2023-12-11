import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { FirebaseService } from 'src/firebase/firebase.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [ConfigModule, PassportModule, JwtModule.register({ secret: 'topSecret', signOptions: {expiresIn: '1h'}}), SharedModule],
  controllers: [AuthController],
  providers: [AuthService, FirebaseService, JwtStrategy],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
