import { Body, Controller, Post, Ip, Req, Delete, Patch, Param, Get, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';
import { AuthGuard } from '@nestjs/passport';
import RefreshTokenDto from './dto/refresh-token.dto';
import { UserAccount } from '../models/userAccount.model';
import { JwtAuthGuard } from 'src/modules/auth/auth/guards/jtw-auth.guard';

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

  @Post('refresh')
  async refreshToken(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @Delete('logout')
  public logout(@Query() body: RefreshTokenDto) {
    return this.authService.logout(body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('deleteAccount')
  public deleteAccount(@Query() body: RefreshTokenDto) {
    return this.authService.deleteAccount(body.refreshToken);
  }

  @Patch()
  public updateUserAuth(@Body() body: UserAccount) {
    return this.authService.updateUserAuth(body)
  }

  @Get(':email')
  public resetPassword(@Param('email') email: string) {
    return this.authService.resetPassword(email)
  }
}
