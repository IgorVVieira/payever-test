import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST api/users', () => {
    const createUserDto: CreateUserDto = {
      first_name: 'Igor',
      last_name: 'Vieira',
      email: 'igor.gutoo634@gmail.com',
    };

    return request(app.getHttpServer())
      .post('/api/users')
      .send(createUserDto)
      .expect((response) => {
        response.body.first_name = 'Igor';
        response.body.last_name = 'Vieira';
        response.body.email = 'igor.gutoo63@gmail.com';
      });
  });

  it('GET api/user/:id', () => {
    const userId = 1;

    return request(app.getHttpServer())
      .get(`/api/user/${userId}`)
      .expect(200)
      .expect((response) => {
        response.body.id = 1;
      });
  });

  it('POST api/users (invalid payload)', () => {
    const createUserDto = {
      first_name: 'Igor',
      last_name: 'Vieira',
      email: 'invalid-email',
    };

    return request(app.getHttpServer())
      .post('/api/users')
      .send(createUserDto)
      .expect(400)
      .expect((response) => {
        response.body.message = [
          'email must be an email',
          'email should not be empty',
        ];
      });
  });

  it('POST api/users (user already exists)', () => {
    const createUserDto: CreateUserDto = {
      first_name: 'Igor',
      last_name: 'Vieira',
      email: 'igor.gutoo63@gmail.com',
    };

    return request(app.getHttpServer())
      .post('/api/users')
      .send(createUserDto)
      .expect(400)
      .expect((response) => {
        response.body.message = 'User already exists';
      });
  });
});

describe('AvatarController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET api/:userId/avatar', () => {
    const userId = 1;

    return request(app.getHttpServer())
      .get(`/api/user/${userId}/avatar`)
      .expect(200)
      .expect((response) => {
        response.body.userId = 1;
      });
  });

  it('DELETE /api/user/:userId/avatar', () => {
    const userId = 1;

    return request(app.getHttpServer())
      .delete(`/api/user/${userId}/avatar`)
      .expect(204);
  });
});
