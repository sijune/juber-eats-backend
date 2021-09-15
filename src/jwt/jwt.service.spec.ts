import { Test } from '@nestjs/testing';
import { JwtService } from './jwt.service';
import * as jwt from 'jsonwebtoken'; //3. 외부 모듈을 사용하지는 않지만 import
import { verify } from 'crypto';
import { CONFIG_OPTIONS } from 'src/common/common.constants';

const TEST_KEY = 'testKey';
const USER_ID = 1;

//2. 외부 모듈 mocking (dependency mocking)
jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn(() => 'TOKEN'),
    verify: jest.fn(() => ({ id: USER_ID })),
  };
});

describe('JwtService', () => {
  let service: JwtService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        //모듈의 의존성을 위해 선언, 그러나 test 값을 지정한다.
        {
          provide: CONFIG_OPTIONS,
          useValue: { privateKey: TEST_KEY },
        },
      ],
    }).compile();
    service = module.get<JwtService>(JwtService);
  });

  it('should be fined', () => {
    expect(service).toBeDefined();
  });
  describe('sign', () => {
    it('should return a signed token', () => {
      const token = service.sign(USER_ID); //1. 서비스 내 외부모듈(jsonwebtoken)을 사용하고 싶지 않음
      expect(typeof token).toBe('string');
      expect(jwt.sign).toHaveBeenCalledTimes(1); //4. mock된 외부모듈 호출가능
      expect(jwt.sign).toHaveBeenCalledWith({ id: USER_ID }, TEST_KEY);
    });
  });
  describe('verify', () => {
    it('should return the decoded token', () => {
      const TOKEN = 'TOKEN';
      const decodedToken = service.verify(TOKEN);
      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(jwt.verify).toHaveBeenCalledWith(TOKEN, TEST_KEY);

      expect(decodedToken).toEqual({ id: USER_ID });
    });
  });
});
