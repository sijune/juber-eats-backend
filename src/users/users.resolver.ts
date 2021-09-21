import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateAccountOutput, CreateAccountInput } from './dtos/create-account.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { LoginOutput, LoginInput } from './dtos/login.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { EditProfileOutput, EditProfileInput } from './dtos/edit-profile.dto';
import { VerifiyEmailOutput, VerifyEmailInput } from './dtos/verify-email.dto';
import { Role } from '../auth/role.decorator';

@Resolver((of) => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation((returns) => CreateAccountOutput)
  async createAccount(@Args('input') createAccountInput: CreateAccountInput): Promise<CreateAccountOutput> {
    return this.usersService.createAccount(createAccountInput);
  }

  @Mutation((returns) => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    return this.usersService.login(loginInput);
  }

  @Query((returns) => User)
  @Role(['Any'])
  me(@AuthUser() authUser: User) {
    return authUser;
  }

  @Query((returns) => UserProfileOutput)
  @Role(['Any'])
  async userProfile(@Args() userProfileInput: UserProfileInput): Promise<UserProfileOutput> {
    return await this.usersService.findById(userProfileInput.userId);
  }

  @Mutation((returns) => EditProfileOutput)
  @Role(['Any'])
  async editProfile(
    @AuthUser() authUser: User, //로그인한 유저만 호출가능
    @Args('input') editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    return this.usersService.editProfile(authUser.id, editProfileInput);
  }

  @Mutation((returns) => VerifiyEmailOutput) //굳이 UseGuards를 안넣어도 된다. editProfile 실행 후에 실행되기 때문에
  async verifyEmail(@Args('input') { code }: VerifyEmailInput): Promise<VerifiyEmailOutput> {
    return this.usersService.verifyEmail(code);
  }
}
