import { Controller, Get, UseGuards, Patch, Body, Param, Post, UseInterceptors, UploadedFile, Query, Res, StreamableFile, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from 'src/modules/auth/auth/guards/jtw-auth.guard';
import { ProfileService } from './profile.service';
import { User } from 'src/modules/auth/models/user.model';
import { UserDetails } from 'src/modules/auth/models/userDetails.model';
import { editFileName, imageFileFilter } from './utils/userProfile.Util';
import ProfileImageDto from './utils/user-profileImage.dto';
import { of, Observable } from 'rxjs';
import { join } from 'path';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  @UseGuards(JwtAuthGuard)
  @Get('userData')
  async getUserData() {
    return await this.profileService.getUserData()
  }

  @UseGuards(JwtAuthGuard)
  @Get('userDashboard/:userId')
  async getUserDashboardData(@Param('userId') userId: string) {
    return await this.profileService.getUserDashboardData(userId)
  }

  @UseGuards(JwtAuthGuard)
  @Patch('updateUserData')
  async update(@Body() body: User) {
    return await this.profileService.updateUserData(body)
  }

  @UseGuards(JwtAuthGuard)
  @Post('profileImage')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './users/profileImages',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async updateImage(@UploadedFile() file: Express.Multer.File) {
    return await this.profileService.updateUserImage(file)
  }

  // @UseGuards(JwtAuthGuard)
  @Get('getProfileImage')
  getProfileImage(@Query() body: ProfileImageDto, @Res() res): Observable<Object> {
    try {

      return res.sendFile(body.profileImage, {root: 'users/profileImages/'})

    } catch (error: unknown) {

      console.warn(`[ERROR]: ${error}`)

      throw new HttpException('Error Getting File', HttpStatus.SERVICE_UNAVAILABLE);

    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('updateUserProfileSettings')
  async updateUserSettings(@Body() body: UserDetails) {
    return await this.profileService.updateUserSettings(body)
  }

  @UseGuards(JwtAuthGuard)
  @Get('getUserFavouriteList/:id')
  async getUserFavouriteList(@Param('id') id: string) {
    return await this.profileService.getUserFavouriteMix(id)
  }

  @UseGuards(JwtAuthGuard)
  @Get('getUserDalleImages')
  async getUserDalleImage() {
    return await this.profileService.getUserDalleImages()
  }

  @UseGuards(JwtAuthGuard)
  @Get('downloadUserDalleImage/:id')
  async downloadUserDalleImage(@Param('id') id: string, @Res({ passthrough: true }) response: Response): Promise<StreamableFile> {

    const userImage = await this.profileService.downloadAiImage(id)
    response.set({
      'Content-Disposition': `inline; filename="${userImage.filename}"`,
      'Content-Type': userImage.mimetype
    })

    return await new StreamableFile(userImage);
  }

}
