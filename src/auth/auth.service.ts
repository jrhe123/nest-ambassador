import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async user(request: Request) {
    const jwt = request.cookies['jwt'];
    const { id } = await this.jwtService.verifyAsync(jwt);
    return this.userService.findOne({
      id,
    });
  }
}
