import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateAccountInput, CreateAccountOutput } from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '../jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { VerifiyEmailOutput } from './dtos/verify-email.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly jwtService: JwtService, //전역으로 설정되어 있으므로 호출 가능
    private readonly mailService: MailService,
  ) {}

  //반환 값을 [] 또는 {}에 담아서 resolver로 보낼 수 있다. (가독성이 더 좋다.)
  async createAccount({ email, password, role }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      //1. 새로운 유저인지 확인
      const exists = await this.users.findOne({ email });
      if (exists) {
        //에러
        return { ok: false, error: 'There is a user with that email already' };
      }

      //2. 유저 생성(create, save) & 비밀번호 hash & verification code 생성
      const user = await this.users.save(this.users.create({ email, password, role }));
      //실제 insert 또는 update 할때 code 생성
      const verification = await this.verifications.save(
        this.verifications.create({
          user, //code는 entity에서 insert된다.
        }),
      );
      this.mailService.sendVerificationEmail(user.email, verification.code);
      return { ok: true };
    } catch (e) {
      //에러
      return { ok: false, error: "Couldn't create account" };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      //1. email 찾기
      const user = await this.users.findOne({ email }, { select: ['id', 'password'] }); //select: 어떤 칼럼을 가져오고 싶은지, entity에 제외된 password를 DB로부터 가져온다.
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        };
      }
      //2. 비밀번호 확인
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong password',
        };
      }
      const token = this.jwtService.sign(user.id); //id를 사용하기 때문에 select에 id 추가
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
    //JWT를 유저에게 부여
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail({ id });
      return {
        ok: true,
        user,
      };
    } catch (error) {
      return { ok: false, error: 'User Not Found' };
    }
    return;
  }

  async editProfile(userId: number, { email, password }: EditProfileInput): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne(userId);

      if (email) {
        user.email = email;
        user.verified = false;
        await this.verifications.delete({
          user: {
            id: user.id,
          },
        });
        const verification = await this.verifications.save(this.verifications.create({ user }));
        this.mailService.sendVerificationEmail(user.email, verification.code);
      }
      if (password) {
        user.password = password;
      }

      await this.users.save(user); //update는 단순히 쿼리를 전달하기만 한다.(비밀번호 hash에 문제), save를 사용해야 entity를 업데이트 하며 entity내 hash기능 사용가능
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not update profile',
      };
    }
  }

  async verifyEmail(code: string): Promise<VerifiyEmailOutput> {
    try {
      const verification = await this.verifications.findOne({ code }, { relations: ['user'] }); //연결된 relation을 가져올때 사용
      if (verification) {
        verification.user.verified = true;
        await this.users.save(verification.user); //verified 변경
        await this.verifications.delete(verification.id); //verification 삭제
        return { ok: true };
      }
      return { ok: false, error: 'Verification not found' };
    } catch (error) {
      return { ok: false, error: 'Could not verify email' };
    }
  }
}
