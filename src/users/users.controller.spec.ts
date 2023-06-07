import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { EmailService } from '../email/email.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
          },
        },
        RabbitMQService,
        EmailService,
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        first_name: 'Igor',
        last_name: 'Vieira',
        email: 'igor.gutoo63@gmail.com',
      };

      const createdUser = {
        id: 1,
        ...createUserDto,
      };

      jest.spyOn(service, 'create').mockResolvedValue(createdUser);

      const result = await controller.create(createUserDto);

      expect(result).toBe(createdUser);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findOne', () => {
    it('should find a user by id', async () => {
      const userId = '1';
      const foundUser = {};

      jest.spyOn(service, 'findOne').mockResolvedValue(foundUser);

      const result = await controller.findOne(userId);

      expect(result).toBe(foundUser);
      expect(service.findOne).toHaveBeenCalledWith(+userId);
    });
  });
});
