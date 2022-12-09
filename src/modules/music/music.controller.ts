import { Controller, Get, StreamableFile, Res, Post, Patch, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { createReadStream } from 'fs';
import { MusicService } from './music.service';
import { join } from 'path';
import type { Response } from 'express';
import { UserFavourite } from '../auth/models/userFavourites.model';
import { UserHistory } from '../auth/models/userHistory.model';
import { DalleRequestE } from './entity/dalleRequest.entity';
import { JwtAuthGuard } from '../auth/auth/guards/jtw-auth.guard';

@Controller('music')
export class MusicController {
  constructor(private readonly musicService: MusicService) { }

  @UseGuards(JwtAuthGuard)
  @Get('mix/:id')
  async downloadMixItem(@Res({ passthrough: true }) res: Response): Promise<StreamableFile> {

    const mixItem = await this.musicService.getdownloadMixItem()

    const file = createReadStream(join(process.cwd(), mixItem));

    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="package.json"',
    });

    return new StreamableFile(file);

  }

  //this is responsible for downloadiong the next clipped mix item
  @UseGuards(JwtAuthGuard)
  @Get('clippedMix/:id')
  async downloadClippedMixItem(@Res({ passthrough: true }) res: Response): Promise<any> {
    const mixItem = await this.musicService.downloadClippedMixItem()

    const file = createReadStream(join(process.cwd(), mixItem));

    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="package.json"',
    });

    return new StreamableFile(file);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id')
  async addUserHistory(@Param('id') id: string, @Body() userHistory: UserHistory): Promise<any> {
    return this.musicService.addHistoryListens(id, userHistory)
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id')
  async addFavouritesMixList(@Param('id') id: string, @Body() userFavourite: UserFavourite): Promise<any> {
    return this.musicService.addFavouritesMixList(id, userFavourite)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteFavouritesMixItem(@Param('id') id: string, @Body() userFavourite: UserFavourite): Promise<any> {
    return this.musicService.deleteFavouriteMix(id, userFavourite)
  }

  @UseGuards(JwtAuthGuard)
  @Get('calmAnxiety')
  async getCalmAnxietyVideo(): Promise<StreamableFile> {
    const todaysVideo = await this.musicService.getCalmAnxietyVideo()

    const file = createReadStream(join(process.cwd(), todaysVideo));

    // res.set({
    //   'Content-Type': 'application/json',
    //   'Content-Disposition': 'attachment; filename="package.json"',
    // });

    return new StreamableFile(file);
  }

  @UseGuards(JwtAuthGuard)
  @Get('nasaPic/')
  async getNasaPicOfDay(): Promise<{}> {
    return this.musicService.getNasaPicOfDay();
  }

  @UseGuards(JwtAuthGuard)
  @Post('generateAiImage')
  async createDalleAiImages(@Body() userRequestBody: DalleRequestE): Promise<any> {
    return this.musicService.createDalleAiImages(userRequestBody)
  }
}
