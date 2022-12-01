import { Body, Controller, Post, Ip, Req, Delete, Put, Param, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';
import { AuthGuard } from '@nestjs/passport';
import RefreshTokenDto from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  public login(@Body() body: Pick<User, 'email' | 'password'>, @Ip() ip: string, @Req() request) {
    return this.authService.login(body.email, body.password, {
      ipAddress: ip,
      userAgent: request.headers['user-agent'],
    });
  }


  @Post('register')
  public register(@Body() body: Omit<User, 'id'>) {
    return this.authService.register(body);
  }


  @Delete('logout')
  async logout(@Body() body: RefreshTokenDto) {
    return this.authService.logout(body.refreshToken);
  }

  @Delete('deleteAccount')
  async deleteAccount(@Body() body: RefreshTokenDto) {
    return this.authService.deleteAccount(body.refreshToken);
  }

  @Put(':id')
  updateUser(@Param('id') id: string) {
    return this.authService.updateUser
  }

  @Get(':email')
  resetPassword(@Param('email') email: string) {
    return this.authService.resetPassword
  }
}
