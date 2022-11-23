import { Controller, Get, StreamableFile, Res, Post } from '@nestjs/common';
import { createReadStream } from 'fs';
import { MusicService } from './music.service';
import { join } from 'path';
import type { Response } from 'express';

@Controller('music')
export class MusicController {
  constructor(private readonly musicService: MusicService) { }

  @Get('mix/:id')
  async downloadMixItem(@Res({ passthrough: true }) res: Response): Promise<StreamableFile> {

    const mixItem = this.musicService.getdownloadMixItem()

    const file = createReadStream(join(process.cwd(), mixItem));

    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="package.json"',
    });

    return new StreamableFile(file);

  }

  //this is responsible for downloadiong the next clipped mix item
  @Get('clippedMix/:id')
  async downloadClippedMixItem(@Res({ passthrough: true }) res: Response): Promise<any> {
    const mixItem = this.musicService.downloadClippedMixItem()

    const file = createReadStream(join(process.cwd(), mixItem));

    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="package.json"',
    });

    return new StreamableFile(file);
  }

  @Post()
  async getShazamIdentified(): Promise<any> {
    return this.musicService.getShazamIdentified()
  }

  @Get('nasaPic/')
  async getNasaPicOfDay(): Promise<{}> {
    return this.musicService.getNasaPicOfDay();
  }

  @Get('calmAnxiety')
  async getCalmAnxietyVideo(): Promise<StreamableFile> {
    const todaysVideo = this.musicService.getdownloadMixItem()

    const file = createReadStream(join(process.cwd(), todaysVideo));

    // res.set({
    //   'Content-Type': 'application/json',
    //   'Content-Disposition': 'attachment; filename="package.json"',
    // });

    return new StreamableFile(file);
  }

  @Post('generateAimage')
  async getUsersAiGenImage(): Promise<any> {

    return this.musicService.getUsersAiGenImage()
  }
}
