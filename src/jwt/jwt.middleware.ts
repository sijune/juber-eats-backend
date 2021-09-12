import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from './jwt.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService, private readonly usersService: UsersService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt'];
      try {
        const decoded = this.jwtService.verify(token.toString()); //배열형태로도 들어올 수 있으므로 toString을 해준다.
        if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
          const loginUser = await this.usersService.findById(decoded['id']);
          req['user'] = loginUser.user;
        }
      } catch (error) {}
    }

    next();
  }
}
