import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';

@Module({
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitmqModule {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async onModuleInit() {
    await this.rabbitMQService.initialize();
  }

  async onApplicationShutdown() {
    await this.rabbitMQService.closeConnection();
  }
}
