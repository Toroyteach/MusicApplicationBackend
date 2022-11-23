import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth/guards/jtw-auth.guard';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) { }

  //this method will post to a message
  @UseGuards(JwtAuthGuard)
  @Post('')
  create(@Body() createChatDto: CreateChatDto) {
    return this.chatsService.create(createChatDto);
  }

  //this method will find all the chats for admin to view
  @UseGuards(JwtAuthGuard)
  @Get('findRoom')
  findRoom(@Body() roomId: any) {
    return this.chatsService.findRoom(roomId);
  }

  //this method gets all the chatrooms available for user to enter
  @UseGuards(JwtAuthGuard)
  @Get('rooms')
  getALlRooms() {
    return this.chatsService.getAllRooms()
  }

  //this method will post in to a message
  @Get(':id')
  findOne(@Param() id: any) {
    return this.chatsService.findOne(id);
  }

  //this method allows a user to update there chat in due time
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
    return this.chatsService.update(+id, updateChatDto);
  }

  //do not allow this
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatsService.remove(+id);
  }
}
