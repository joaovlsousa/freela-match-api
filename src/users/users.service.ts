import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';

import { UpdateProfileDto } from './dtos/update-profile-dto';

@Injectable()
export class UsersService {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {}

  async create(code: string) {
    const accessTokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      null,
      {
        params: {
          client_id: this.configService.getOrThrow('GITHUB_CLIENT_ID'),
          client_secret: this.configService.getOrThrow('GITHUB_CLIENT_SECRET'),
          code,
        },
        headers: {
          Accept: 'application/json',
        },
      },
    );

    const { access_token } = accessTokenResponse.data;

    const [userData, userEmails] = await Promise.all([
      axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: 'application/json',
        },
      }),
      axios.get('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: 'application/json',
        },
      }),
    ]);

    const { email } = userEmails.data.find((email) => email.primary);
    const { id, name, avatar_url, login } = userData.data;

    let user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      user = await this.prismaService.user.create({
        data: {
          id,
          name,
          email,
          username: login,
          imageUrl: avatar_url,
          profile: {
            create: {},
          },
        },
      });
    }

    return {
      userId: id,
    };
  }

  async getUserById(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        name: true,
        email: true,
        username: true,
        imageUrl: true,
        createdAt: true,
        profile: {
          select: {
            bio: true,
            techs: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return {
      user,
    };
  }

  async getUserByUsername(username: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        username,
      },
      select: {
        name: true,
        email: true,
        username: true,
        imageUrl: true,
        createdAt: true,
        profile: {
          select: {
            bio: true,
            techs: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return {
      user,
    };
  }

  async updateProfile(profileData: UpdateProfileDto, userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const profile = await this.prismaService.profile.update({
      where: {
        userId,
      },
      data: {
        bio: profileData.bio,
        techs: profileData.techs,
      },
      select: {
        bio: true,
        techs: true,
      },
    });

    return {
      profile,
    };
  }
}
