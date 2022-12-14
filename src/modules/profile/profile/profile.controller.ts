import { Controller, Get, UseGuards, Patch, Body, Param, Post, UseInterceptors, UploadedFile, FileTypeValidator, MaxFileSizeValidator, ParseFilePipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  @Patch('updateUserData')
  async update(@Body() body: User) {
    return await this.profileService.updateUserData(body)
  }

  //@UseGuards(JwtAuthGuard)
  @Post('profileImage')
  @UseInterceptors(FileInterceptor('file'))
  async updateImage(@UploadedFile(
    new ParseFilePipe({
      validators: [
        new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
      ],
    }),
  ) file: Express.Multer.File) {
    return await this.profileService.updateUserImage(file)
  }

  @UseGuards(JwtAuthGuard)
  @Post('updateUserProfileSettings')
  async updateUserSettings(@Body() body: UserDetails) {
    return await this.profileService.updateUserSettings(body)
  }

  //@UseGuards(JwtAuthGuard)
  @Get('getUserDalleImages')
  async getUserDalleImage() {
    return await this.profileService.getUserDalleImages()
  }

  //@UseGuards(JwtAuthGuard)
  @Get('downloadUserDalleImage/:id')
  async downloadUserDalleImage(@Param('id') id: string) {
    return await this.profileService.downloadAiImage(id)
  }

  //@UseGuards(JwtAuthGuard)
  @Get('deleteUserAccount')
  async deleteUserAccount() {
    return await this.profileService.deleteUserAccountPlusData()
  }

}
