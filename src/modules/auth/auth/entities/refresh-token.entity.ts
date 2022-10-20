
import { sign } from 'jsonwebtoken';

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
    return sign({ ...this }, 'topSecretRefresh');
  }
}

export default RefreshToken;