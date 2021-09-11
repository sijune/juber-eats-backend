import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput } from './dtos/login.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '../jwt/jwt.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  //반환 값을 [] 또는 {}에 담아서 resolver로 보낼 수 있다. (가독성이 더 좋다.)
  async createAccount({ email, password, role }: CreateAccountInput): Promise<{ ok: boolean; error?: string }> {
    try {
      //1. 새로운 유저인지 확인
      const exists = await this.users.findOne({ email });
      if (exists) {
        //에러
        return { ok: false, error: 'There is a user with that email already' };
      }

      //2. 유저 생성(create, save) & 비밀번호 hash
      await this.users.save(this.users.create({ email, password, role }));
      return { ok: true };
    } catch (e) {
      //에러
      return { ok: false, error: "Couldn't create account" };
    }
  }

  async login({ email, password }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
    try {
      //1. email 찾기
      const user = await this.users.findOne({ email });
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
      const token = this.jwtService.sign(user.id);
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

  async findById(id: number): Promise<User> {
    return this.users.findOne({ id });
  }
}
