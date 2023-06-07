import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailModule } from './email/email.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { AvatarModule } from './avatar/avatar.module';

import 'dotenv/config';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI),
    UsersModule,
    EmailModule,
    RabbitmqModule,
    AvatarModule,
  ],
})
export class AppModule {}
