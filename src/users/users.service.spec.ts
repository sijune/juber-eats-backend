import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { Verification } from './entities/verification.entity';
import { User } from './entities/user.entity';
import { verify } from 'crypto';
import { JwtService } from '../jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';

const mockRepository = {
  findOne: jest.fn(), //가짜함수 작성
  save: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(), //가짜함수 작성
  verify: jest.fn(),
};

const mockMailService = {
  sendVerificationEmail: jest.fn(), //가짜함수 작성
};

//함수를 모두 Mock타입으로 만든다.
type MockRepository<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
  let service: UsersService;
  let usersRepository: MockRepository<User>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        //진짜 Service
        UsersService,
        //가짜 Repository, Service
        {
          //Mock Repository
          provide: getRepositoryToken(User), //typeOrm 테스트 모듈
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    it('should fail if user exists', async () => {
      //db에 있다고 속일 수 있다.
      //findOne 실행 시 return 값 지정, 코드에 바로 반환값을 지정시킨다.
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: '',
      });
      const result = await service.createAccount({
        email: '',
        password: '',
        role: 0,
      });
      expect(result).toMatchObject({ ok: false, error: 'There is a user with that email already' });
    });
  });
  it.todo('login');
  it.todo('findById');
  it.todo('editProfile');
  it.todo('verifyEmail');
});
