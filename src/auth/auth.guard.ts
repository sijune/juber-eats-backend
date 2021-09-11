import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context).getContext(); //http Context -> gql Context
    const user = gqlContext['user'];
    console.log(user);
    if (!user) {
      return false;
    }
    return true;
  }
}
