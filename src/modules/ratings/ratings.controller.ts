import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  create(@Body() createRatingDto: CreateRatingDto) {
    return this.ratingsService.create(createRatingDto);
  }

  @Get(':id')
  findOne(@Body() getRatingDto: CreateRatingDto) {
    return this.ratingsService.findOne(getRatingDto);
  }

  @Patch(':id')
  update(@Body() updateRatingDto: UpdateRatingDto) {
    return this.ratingsService.update(updateRatingDto);
  }
}
