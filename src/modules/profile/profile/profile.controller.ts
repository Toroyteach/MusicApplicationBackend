import { Controller, Get, UseGuards, Put, Body, Param } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/auth/guards/jtw-auth.guard';
import { ProfileService } from './profile.service';
import { User } from 'src/modules/auth/models/user.model';
import { UserDetails } from 'src/modules/auth/models/userDetails.model';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  @UseGuards(JwtAuthGuard)
  @Get('userData')
  async getUserData() {
    return await this.profileService.getUserData()
  }

  @UseGuards(JwtAuthGuard)
  @Get('dashboardData')
  async getDashboardData() {
    return await this.profileService.getDashboardData()
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: User) {
    return await this.profileService.updateUserData(id, body)
  }

  @UseGuards(JwtAuthGuard)
  @Put('/profileImage/:id')
  async updateImage(@Param('id') id: string, @Body() body) {
    return await this.profileService.updateUserImage(id, body)
  }

  @UseGuards(JwtAuthGuard)
  @Put('profileSettings/:id')
  async updateUserSettings(@Param('id') id: string, @Body() body: UserDetails) {
    return await this.profileService.updateUserSettings(id, body)
  }
}
