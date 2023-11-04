import { IsNotEmpty } from 'class-validator';

class ProfileImageDto {
  @IsNotEmpty()
  profileImage: string;
}

export default ProfileImageDto;