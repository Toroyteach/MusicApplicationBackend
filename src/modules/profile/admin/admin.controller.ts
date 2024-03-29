import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Ip, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/auth/guards/jtw-auth.guard';
import { User } from 'src/modules/auth/models/user.model';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateMixItemDto } from './dto/create-mix-item.dto';
import { MixEnabledStatus } from './dto/mixStatus.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UpdateMixItemDto } from './dto/update-mix-item.dto';
import { UserComment } from './dto/update-user-comment.dto';
import { EnableCommentsOnMix } from './dto/updateMixComment.dto';
import { UserAccountStatus } from './dto/userStatus.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @UseGuards(JwtAuthGuard)
  @Get('allUsers')
  findAllUsers() {
    return this.adminService.findAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Post('disableUser/:id')
  disableUser(@Param('id') id: string, @Body() body: UserAccountStatus) {
    return this.adminService.disableUser(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('getAppSettingsData')
  getAppSettingsData() {
    return this.adminService.getAppData();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('updateApplicationSettings')
  updateAppSettings(@Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.updateAppSettings(updateAdminDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('disableMixItem/:id')
  disableMixitem(@Param('id') id: string, @Body() body: MixEnabledStatus) {
    return this.adminService.disableMixItem(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('disableCommentOnMix/:id')
  disableCommentOnMix(@Param('id') id: string, @Body() body: EnableCommentsOnMix) {
    return this.adminService.disableCommentOnMixItem(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('disableUserCommentOnMix/:id')
  disableUserCommentOn(@Param('id') id: string, @Body() body: UserComment) {
    return this.adminService.disableUserCommentItem(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('getAllDalleImages/:id')
  getUsersDalleGenImages(@Param('id') id: string) {
    return this.adminService.getUsersDalleGenImages(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('createMixItem')
  create(@Body() createMixItemDto: CreateMixItemDto) {
    return this.adminService.createMixItem(createMixItemDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('getAllMixItems')
  getAllMixItems() {
    return this.adminService.getAllMixItems()
  }

  @UseGuards(JwtAuthGuard)
  @Patch('updateMixItem/:id')
  updateMixItem(@Param('id') id: string, @Body() updateMixItem: UpdateMixItemDto) {
    return this.adminService.updateMixItem(id, updateMixItem)
  }

  @UseGuards(JwtAuthGuard)
  @Delete('deleteMixItem/:id')
  deleteMixItem(@Param('id') id: string) {
    return this.adminService.deleteMixItem(id)
  }

  @Post('loginSocial')
  public loginSocial(@Body() body: User, @Ip() ip: string, @Req() request) {
    return this.adminService.loginSocially(body, {
      ipAddress: ip,
      userAgent: request.headers['user-agent'],
    });
  }
}
