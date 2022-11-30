import { PartialType } from '@nestjs/mapped-types';
import { CreateMixItemDto } from './create-mix-item.dto';

export class UpdateMixItemDto extends PartialType(CreateMixItemDto) {}