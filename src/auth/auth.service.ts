import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface PayloadJwtToken {
  userId: number;
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  generateAccessToken(payload: PayloadJwtToken) {
    return {
      accesToken: this.jwtService.sign({ sub: payload.userId }),
    };
  }
}
