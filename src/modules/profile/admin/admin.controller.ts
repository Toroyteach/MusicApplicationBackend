import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/auth/guards/jtw-auth.guard';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateMixItemDto } from './dto/create-mix-item.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UpdateMixItemDto } from './dto/update-mix-item.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  //@UseGuards(JwtAuthGuard)
  @Get()
  findAllUsers() {
    return this.adminService.findAllUsers();
  }

  //@UseGuards(JwtAuthGuard)
  @Get(':id')
  disableUser(@Param('id') id: string) {
    return this.adminService.disableUser(id);
  }

  //@UseGuards(JwtAuthGuard)
  @Patch()
  updateAppSettings(@Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.updateAppSettings(updateAdminDto);
  }

  //@UseGuards(JwtAuthGuard)
  @Patch(':id')
  disableMixitem(@Param('id') id: string, @Body() body: any) {
    return this.adminService.disableMixItem(id, body);
  }

  //@UseGuards(JwtAuthGuard)
  @Get()
  getUsersDalleGenImages() {
    return this.adminService.getUsersDalleGenImages();
  }

  //@UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createMixItemDto: CreateMixItemDto) {
    return this.adminService.createMixItem(createMixItemDto);
  }

  //@UseGuards(JwtAuthGuard)
  @Get()
  getAllMixItems() {
    return this.adminService.getAllMixItems()
  }

  //@UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateMixItem(@Param('id') id: string, @Body() updateMixItem: UpdateMixItemDto) {
    return this.adminService.updateMixItem(id, updateMixItem)
  }

  //@UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteMixItem(@Param('id') id: string) {
    return this.adminService.deleteMixItem(id)
  }
}
