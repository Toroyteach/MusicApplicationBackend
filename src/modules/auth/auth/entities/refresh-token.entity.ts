import { ConfigService } from '@nestjs/config';
import { sign } from 'jsonwebtoken'
import { Config } from 'src/firebase/config.models';

class RefreshToken {
  constructor(init?: Partial<RefreshToken>) {
    Object.assign(this, init);
  }

  id: number;
  userId: string;
  userAgent: string;
  ipAddress: string;
  userEmail: string;

  sign(): string {

    const refreshSecrete = 'D57684B7221F533C1F23F31FD3949'//this.configService.get<string>('REFRESH_SECRET')

    return sign({ ...this }, refreshSecrete);
  }
}

export default RefreshToken;