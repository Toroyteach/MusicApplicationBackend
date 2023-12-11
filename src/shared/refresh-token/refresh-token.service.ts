// shared/refresh-token.service.ts
import { Injectable } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/modules/auth/models/user.model';
import RefreshToken from 'src/modules/auth/auth/entities/refresh-token.entity';
import { Config } from 'src/firebase/config.models';

@Injectable()
export class RefreshTokenService {
  private refreshTokens: RefreshToken[] = [];

  constructor(private readonly configService: ConfigService<Config>) {}

  generateToken(user: User, values: { userAgent: string; ipAddress: string }): { accessToken: string; refreshToken: string } {
    const refreshObject = new RefreshToken({
      id: this.refreshTokens.length === 0 ? 0 : this.refreshTokens[this.refreshTokens.length - 1].id + 1,
      ...values,
      userId: user.id,
    });

    this.refreshTokens.push(refreshObject);

    try {

      const accessSecret = this.configService.get<string>('ACCESS_SECRET');

      return {
        refreshToken: refreshObject.sign(),
        accessToken: sign(
          {
            userId: user.id,
            userEmail: user.email,
          },
          accessSecret,
          {
            expiresIn: '1h',
          },
        )
      };
    } catch (error) {

      throw new Error('Failed to generate tokens.');
    }
  }

  retrieveRefreshToken(refreshStr: string): RefreshToken | undefined {
    try {
      const refreshSecret = this.configService.get<string>('REFRESH_SECRET');
      const decoded = verify(refreshStr, refreshSecret);

      if (typeof decoded === 'string') {
        return undefined;
      }

      return this.refreshTokens.find((token) => token.id === decoded.id);
    } catch (e) {
      return undefined;
    }
  }

  revokeTokensForUser(userId: number): void {
    this.refreshTokens = this.refreshTokens.filter((token) => token.id !== userId);
  }
}
