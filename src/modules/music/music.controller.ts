import { Controller, Get, StreamableFile, Res, Post, Body, Delete, UseGuards, Query, Param } from '@nestjs/common';
import { MusicService } from './music.service';
import type { Response } from 'express';
import { UserFavourite } from '../auth/models/userFavourites.model';
import { UserHistory } from '../auth/models/userHistory.model';
import { DalleRequestE } from './entity/dalleRequest.entity';
import { JwtAuthGuard } from '../auth/auth/guards/jtw-auth.guard';
import { ShazamRequest } from './entity/shazamrequest.entity';
import { MixDownloadRequest } from './entity/mixDownload.entity';
import { ClippedMixDownload } from './entity/clippedMix.entity';

@Controller('music')
export class MusicController {
  constructor(private readonly musicService: MusicService) { }

  @UseGuards(JwtAuthGuard)
  @Get('mixDownload/:id')
  async downloadMixItem(@Body() downloadRequest: MixDownloadRequest, @Res({ passthrough: true }) response: Response): Promise<StreamableFile> {

    const mixItem = await this.musicService.getdownloadMixItem(downloadRequest)

    response.set({
      'Content-Disposition': `inline; filename="${mixItem.filename}"`,
      'Content-Type': mixItem.mimetype
    })

    return new StreamableFile(mixItem);

  }

  @UseGuards(JwtAuthGuard)
  @Get('clippedMix')
  async downloadClippedMixItem(@Query() data: ClippedMixDownload, @Res({ passthrough: true }) response: Response): Promise<StreamableFile> {
    const clippedItem = await this.musicService.downloadClippedMixItem(data)
    response.set({
      'Content-Disposition': `inline; filename="${clippedItem.filename}"`,
      'Content-Type': 'audio/opus'
    })

    return new StreamableFile(clippedItem);
  }

  @UseGuards(JwtAuthGuard)
  @Get('getMix')
  async getMix(): Promise<{}> {
    return this.musicService.getMixList();
  }

  @UseGuards(JwtAuthGuard)
  @Post('addUserHistory')
  async addUserHistory(@Query() userHistory: UserHistory): Promise<any> {
    return this.musicService.addHistoryListens(userHistory)
  }

  @UseGuards(JwtAuthGuard)
  @Post('addUserFavourite')
  async addFavouritesMixList(@Body() userFavourite: UserFavourite): Promise<any> {
    return this.musicService.addFavouritesMixList(userFavourite)
  }

  @UseGuards(JwtAuthGuard)
  @Delete('deleteUserFavourite/:id')
  async deleteFavouritesMixItem(@Param("id") id: string): Promise<any> {
    return this.musicService.deleteFavouriteMix(id)
  }

  @UseGuards(JwtAuthGuard)
  @Get('anxietyVideo')
  async getCalmAnxietyVideo(@Res({ passthrough: true }) response: Response): Promise<StreamableFile> {

    const todaysVideo = await this.musicService.getCalmAnxietyVideo()

    response.set({
      'Content-Disposition': `inline; filename="${todaysVideo.filename}"`,
      'Content-Type': todaysVideo.mimetype
    })

    return new StreamableFile(todaysVideo);
  }

  @UseGuards(JwtAuthGuard)
  @Get('astronomy')
  async getNasaPicOfDay(): Promise<{}> {
    return this.musicService.getNasaPicOfDay();
  }

  @UseGuards(JwtAuthGuard)
  @Post('generateAiImage')
  async createDalleAiImages(@Query() userRequestBody: DalleRequestE): Promise<any> {
    return this.musicService.createDalleAiImages(userRequestBody)
  }

  //@UseGuards(JwtAuthGuard)
  @Post('generateShazamReq')
  async createShazamReq(@Query() userShazamBody: ShazamRequest): Promise<any> {
    return this.musicService.createShazamRequest(userShazamBody)
  }
}
