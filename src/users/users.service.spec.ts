import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { Verification } from './entities/verification.entity';
import { User } from './entities/user.entity';
import { verify } from 'crypto';
import { JwtService } from '../jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';

const mockRepository = () => ({
  findOne: jest.fn(), //가짜함수 작성
  save: jest.fn(),
  create: jest.fn(),
});

const mockJwtService = {
  sign: jest.fn(() => 'signed-token'), //mock implementation
  verify: jest.fn(),
};

const mockMailService = {
  sendVerificationEmail: jest.fn(), //가짜함수 작성
};

//함수를 모두 Mock타입으로 만든다.
type MockRepository<T> = Partial<Record<keyof Repository<T>, jest.Mock>>; //create, findOne, save...

describe('UserService', () => {
  let service: UsersService;
  let usersRepository: MockRepository<User>;
  let verificationsRepository: MockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;

  //beforeAll(async () => { //동일 mock에 모든 테스트의 데이터를 저장한다.
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        //진짜 Service
        UsersService,
        //가짜 Repository, Service
        {
          //Mock Repository
          provide: getRepositoryToken(User), //typeOrm 테스트 모듈
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
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
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationsRepository = module.get(getRepositoryToken(Verification));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  //mock을 통해 function에 값과 행동을 명시할 수 있다.
  describe('createAccount', () => {
    const createAccountArgs = {
      email: '',
      password: '',
      role: 0,
    };

    it('should fail if user exists', async () => {
      //db에 있다고 속일 수 있다.
      //findOne 실행 시 return 값 지정, 코드에 바로 반환값을 지정시킨다.
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: '',
      });
      const result = await service.createAccount(createAccountArgs);
      expect(result).toMatchObject({ ok: false, error: 'There is a user with that email already' });
    });

    it('should create a new user', async () => {
      //함수 호출 시 return 값 지정
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.create.mockReturnValue(createAccountArgs);
      usersRepository.save.mockResolvedValue(createAccountArgs);
      verificationsRepository.create.mockReturnValue({ user: createAccountArgs });
      verificationsRepository.save.mockResolvedValue({ code: 'code' });

      const result = await service.createAccount(createAccountArgs);

      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);

      expect(verificationsRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.create).toHaveBeenCalledWith({ user: createAccountArgs });
      expect(verificationsRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.save).toHaveBeenCalledWith({ user: createAccountArgs });

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(expect.any(String), expect.any(String));

      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error()); //fail 할 것이다.
      const result = await service.createAccount(createAccountArgs);
      expect(result).toEqual({ ok: false, error: "Couldn't create account" });
    });
  });
  describe('login', () => {
    const loginArgs = {
      email: 'bs@email.com',
      password: 'bs.password',
    };
    it('should fail if user does not exists', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      const result = await service.login(loginArgs);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
      expect(result).toEqual({ ok: false, error: 'User not found' });
    });
    it('should fail if the password is wrong', async () => {
      const mockedUser = {
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(result).toEqual({
        ok: false,
        error: 'Wrong password',
      });
    });
    it('should return token if password correct', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)), //mock implementation
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);

      const result = await service.login(loginArgs);

      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));

      expect(result).toEqual({
        ok: true,
        token: 'signed-token',
      });
    });
  });
  it.todo('findById');
  it.todo('editProfile');
  it.todo('verifyEmail');
});
