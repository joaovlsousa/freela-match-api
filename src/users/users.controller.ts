import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CurrentUserDto } from 'src/auth/dtos/current-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import { CreateUserDto } from './dtos/create-user-dto';
import { UpdateProfileDto } from './dtos/update-profile-dto';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateUserDto) {
    const { userId } = await this.usersService.create(body.code);

    return this.authService.generateAccessToken({ userId });
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getCurrentUserData(@CurrentUser() currentUser: CurrentUserDto) {
    return this.usersService.getUserById(currentUser.userId);
  }

  @Get(':username')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getUserData(@Param('username') username: string) {
    return this.usersService.getUserByUsername(username);
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateProfile(
    @CurrentUser() currentUser: CurrentUserDto,
    @Body() body: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(body, currentUser.userId);
  }
}
