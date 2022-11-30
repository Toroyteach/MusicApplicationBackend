import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateMixItemDto } from './dto/create-mix-item.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UpdateMixItemDto } from './dto/update-mix-item.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Get()
  findAllUsers() {
    return this.adminService.findAllUsers();
  }

  @Get(':id')
  disableUser(@Param('id') id: string) {
    return this.adminService.disableUser(id);
  }

  @Put()
  updateAppSettings(@Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.updateAppSettings(updateAdminDto);
  }

  @Put(':id')
  disableMixitem(@Param('id') id: string, @Body() body: any) {
    return this.adminService.disableMixItem(id, body);
  }

  @Get()
  getUsersDalleGenImages() {
    return this.adminService.getUsersDalleGenImages();
  }

  @Post()
  create(@Body() createMixItemDto: CreateMixItemDto) {
    return this.adminService.createMixItem(createMixItemDto);
  }

  @Get()
  getAllMixItems() {
    return this.adminService.getAllMixItems()
  }

  @Put(':id')
  updateMixItem(@Param('id') id: string, @Body() updateMixItem: UpdateMixItemDto) {
    return this.adminService.updateMixItem(id, updateMixItem)
  }

  @Delete(':id')
  deleteMixItem(@Param('id') id: string) {
    return this.adminService.deleteMixItem(id)
  }
}
