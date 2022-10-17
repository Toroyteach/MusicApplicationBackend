import { Controller, Get, UseGuards} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/auth/guards/jtw-auth.guard';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(JwtAuthGuard)
  @Get('userData')
  public getUserData() {
    return this.profileService.getUserData()
  }
}
