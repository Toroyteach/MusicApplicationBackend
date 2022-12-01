import { PartialType } from '@nestjs/mapped-types';
import { CreateUserNotifiedDto } from './create-userNotified.dto';

export class UpdateUserNotifiedDto extends PartialType(CreateUserNotifiedDto) {}
