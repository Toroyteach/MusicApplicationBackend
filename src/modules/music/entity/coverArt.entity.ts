import { IsNotEmpty } from 'class-validator';

export class CoverArtImageDto {
    @IsNotEmpty()
    coverArtImage: string;
}