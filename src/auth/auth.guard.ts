import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { AllowedRoles } from './role.decorator';
import { JwtService } from '../jwt/jwt.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext) {
    //reflector를 이용해 metadata에서 값을 가져온다.
    const roles = this.reflector.get<AllowedRoles>('roles', context.getHandler());

    // 1. public resolver인 경우
    if (!roles) {
      //undefined 즉, public resolver인 경우 ex. createAccount
      return true;
    }

    // 2. User가 있는 경우(Token이 있는 경우)
    const gqlContext = GqlExecutionContext.create(context).getContext(); //http Context -> gql Context
    console.log(gqlContext.token);

    const token = gqlContext.token;
    if (token) {
      const decoded = this.jwtService.verify(token.toString()); //배열형태로도 들어올 수 있으므로 toString을 해준다.
      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        const { user } = await this.usersService.findById(decoded['id']);

        if (!user) {
          return false;
        }
        gqlContext['user'] = user; //AuthUser 이전에 AuthGuard가 호출되므로 user를 넣어준다.
        if (roles.includes('Any')) {
          return true;
        }
        return roles.includes(user.role);
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}
