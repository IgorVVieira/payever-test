import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import axios from 'axios';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class UsersService {
  private readonly api = 'https://reqres.in/api';

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly emailService: EmailService,
    private readonly rabbitmqService: RabbitMQService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email } = createUserDto;
    let user = await this.findUserByEmail(email);

    if (user) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    user = await this.userModel.create(createUserDto);

    await this.emailService.sendEmail(
      user.email,
      'Welcome',
      'Welcome to the app',
    );
    await this.rabbitmqService.sendEvent('user_created', 'user.created', user);

    return user;
  }

  async findOne(id: number) {
    const { data } = await axios.get(`${this.api}/users/${id}`);
    if (!data) {
      throw new NotFoundException('User not found');
    }
    return data;
  }

  private async findUserByEmail(email: string): Promise<User | undefined> {
    return await this.userModel.findOne({ email });
  }
}
