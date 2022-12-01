import { PartialType } from '@nestjs/mapped-types';
import { CreateUserRatingDto } from './create-userRating.dto';

export class UpdateUserRatingDto extends PartialType(CreateUserRatingDto) {}
