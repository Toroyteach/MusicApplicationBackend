import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { JwtAuthGuard } from '../auth/auth/guards/jtw-auth.guard';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createRatingDto: CreateRatingDto) {
    return this.ratingsService.create(createRatingDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findOne(@Body() getRatingDto: CreateRatingDto) {
    return this.ratingsService.findOne(getRatingDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  update(@Body() updateRatingDto: UpdateRatingDto) {
    return this.ratingsService.update(updateRatingDto);
  }
}
