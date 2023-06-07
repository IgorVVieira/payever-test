import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import axios from 'axios';
import { NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { EmailService } from '../email/email.service';

const userModelMock = {
  create: jest.fn().mockReturnValue({}),
  findOne: jest.fn(),
};

const emailServiceMock = {
  sendEmail: jest.fn(),
};

const rabbitMQServiceMock = {
  sendEvent: jest.fn(),
  initialize: jest.fn(),
  closeConnection: jest.fn(),
};

jest.mock('axios');
const axiosMock = axios as jest.Mocked<typeof axios>;
axiosMock.get.mockResolvedValue({ data: {} });

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: userModelMock,
        },
        {
          provide: EmailService,
          useValue: emailServiceMock,
        },
        {
          provide: RabbitMQService,
          useValue: rabbitMQServiceMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        first_name: 'Igor',
        last_name: 'Vieira',
        email: 'test@example.com',
      };

      userModelMock.findOne.mockResolvedValue(null);
      userModelMock.create.mockResolvedValue(createUserDto);

      const result = await service.create(createUserDto);

      expect(userModelMock.findOne).toHaveBeenCalledWith({
        email: createUserDto.email,
      });
      expect(userModelMock.create).toHaveBeenCalledWith(createUserDto);
      expect(emailServiceMock.sendEmail).toHaveBeenCalledWith(
        createUserDto.email,
        'Welcome',
        'Welcome to the app',
      );
      expect(rabbitMQServiceMock.sendEvent).toHaveBeenCalledWith(
        'user_created',
        'user.created',
        createUserDto,
      );
      expect(result).toEqual(createUserDto);
    });

    it('should throw an error if user already exists', async () => {
      const createUserDto: CreateUserDto = {
        first_name: 'Igor',
        last_name: 'Vieira',
        email: 'test@example.com',
      };

      userModelMock.findOne.mockResolvedValue(createUserDto);

      await expect(service.create(createUserDto)).rejects.toThrowError(
        new HttpException('User already exists', HttpStatus.BAD_REQUEST),
      );

      expect(userModelMock.findOne).toHaveBeenCalledWith({
        email: createUserDto.email,
      });
      expect(userModelMock.create).not.toHaveBeenCalled();
      expect(emailServiceMock.sendEmail).not.toHaveBeenCalled();
      expect(rabbitMQServiceMock.sendEvent).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should find a user by ID', async () => {
      const userId = 1;
      const userData = { id: userId, name: 'John Doe' };
      axiosMock.get.mockResolvedValue({ data: userData });

      const result = await service.findOne(userId);

      expect(axiosMock.get).toHaveBeenCalledWith(
        `${service['api']}/users/${userId}`,
      );
      expect(result).toEqual(userData);
    });

    it('should throw a not found exception if user does not exist', async () => {
      const userId = 1;
      axiosMock.get.mockResolvedValue({ data: null });

      await expect(service.findOne(userId)).rejects.toThrowError(
        new NotFoundException('User not found'),
      );

      expect(axiosMock.get).toHaveBeenCalledWith(
        `${service['api']}/users/${userId}`,
      );
    });
  });
});
