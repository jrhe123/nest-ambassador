import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    try {
      const jwt = request.cookies['jwt'];
      const { scope } = await this.jwtService.verify(jwt);
      const is_ambassador = request.path.toString().includes('ambassador');
      return (
        (is_ambassador && scope === 'ambassador') ||
        (!is_ambassador && scope === 'admin')
      );
    } catch (error) {
      // console.error('auth guard error: ', error);
      return false;
    }
  }
}
